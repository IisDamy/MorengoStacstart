import { useEffect, useMemo, useState } from "react";
import {
  Modal, View, Text, TextInput, Pressable, FlatList,
  ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { RunPaystackAction } from "@/lib/appwrite"; // your path

export default function ConnectBankModal({ visible, onClose, userId, onSuccess }) {
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState(null); // { name, code }

  const [resolving, setResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState("");
  const [resolveError, setResolveError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // load banks the first time the modal opens
  useEffect(() => {
    if (!visible || banks.length) return;
    (async () => {
      setLoadingBanks(true);
      const r = await RunPaystackAction("bank.directory", {});
      setBanks((r?.banks ?? []).filter(Boolean));
      
      setLoadingBanks(false);
    })();
  }, [visible]);

 
  // auto-resolve once bank + 10-digit number are present
  useEffect(() => {
     if (!visible) return;
    setResolvedName("");
    setResolveError("");
    setResolving(false);
    if (accountNumber.length !== 10 || !bank) return;

    let cancelled = false; // ignore stale responses if inputs change mid-request
    (async () => {
      setResolving(true);
      const r = await RunPaystackAction("bank.resolve", {
        accountNumber,
        bankCode: bank?.code,
      });
      if (cancelled) return;
      setResolving(false);
      if (!r || r.error || r.success === false) {
        setResolveError(r?.error || r?.message || "Couldn't verify this account");
      } else {
        setResolvedName(r.accountName);
      }
    })();
    return () => { cancelled = true; };
  }, [accountNumber, bank, visible] );

  const filtered = useMemo(
    () => banks.filter(b => b.name.toLowerCase().includes(search.toLowerCase())),
    [banks, search]
  );

  const canSubmit = !!resolvedName && !submitting;

  const reset = () => {
    setAccountNumber(""); setBank(null); setSearch("");
    setResolvedName(""); setResolveError("");
  };

  const handleClose = () => { reset(); onClose(); };

  const handleConfirm = async () => {
    setSubmitting(true);
    const r = await RunPaystackAction("bank.add", {
      userId,
      accountNumber,
      bankCode: bank?.code,
    });
    setSubmitting(false);

    if (!r || r.error || r.success === false) {
      Alert.alert("Couldn't add account", r?.error || r?.message || "Something went wrong");
      return;
    }
    Alert.alert("Submitted", r.message || "Pending admin verification.");
    onSuccess?.(r);
    handleClose();
  };

   useEffect(()=> {
    console.log(banks, 'wergre')
  },[visible,banks])


  
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={s.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.sheet} className="pb-24">
          <Text style={s.title}>Connect bank account</Text>

          <Text style={s.label}>Bank</Text>
          <Pressable style={s.input} onPress={() => setPickerOpen(true)}>
            {loadingBanks
              ? <ActivityIndicator />
              : <Text style={{ color: bank ? "#111" : "#999" }}>{bank?.name ?? "Select bank"}</Text>}
          </Pressable>

          <Text style={s.label}>Account number</Text>
          <TextInput
            style={s.input}
            value={accountNumber}
            onChangeText={t => setAccountNumber(t.replace(/\D/g, "").slice(0, 10))}
            keyboardType="number-pad"
            placeholder="10-digit account number"
            maxLength={10}
          />

          {/* resolved name confirmation */}
          <View style={s.resolveBox}>
            {resolving && (
              <View style={s.rowCenter}>
                <ActivityIndicator size="small" />
                <Text style={s.muted}>Verifying account…</Text>
              </View>
            )}
            {!!resolvedName && (
              <View>
                <Text style={s.muted}>Account name</Text>
                <Text style={s.resolvedName}>{resolvedName}</Text>
                <Text style={s.muted}>Is this you? Tap Confirm to continue.</Text>
              </View>
            )}
            {!!resolveError && <Text style={s.error}>{resolveError}</Text>}
          </View>

          <View style={s.row}>
            <Pressable style={[s.btn, s.cancel]} onPress={handleClose} disabled={submitting}>
              <Text>Cancel</Text>
            </Pressable>
            <Pressable
              style={[s.btn, s.confirm, !canSubmit && { opacity: 0.5 }]}
              onPress={handleConfirm}
              disabled={!canSubmit}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontWeight: "600" }}>Confirm</Text>}
            </Pressable>
          </View>
        </View>

        {/* Bank picker */}
        <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
          <View style={s.picker}>
            <TextInput
              style={s.input}
              value={search}
              onChangeText={setSearch}
              placeholder="Search bank"
              autoFocus
            />
            <FlatList
              data={filtered}
              keyExtractor={b => String(b?.code) + b.name}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={s.bankRow}
                  onPress={() => { setBank(item); setPickerOpen(false); setSearch(""); }}
                >
                  <Text>{item.name}</Text>
                </Pressable>
              )}
            />
            <Pressable style={[s.btn, s.cancel]} onPress={() => setPickerOpen(false)}>
              <Text>Close</Text>
            </Pressable>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  label: { marginTop: 12, marginBottom: 4, color: "#555", fontSize: 13 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, minHeight: 46, justifyContent: "center" },
  resolveBox: { minHeight: 64, justifyContent: "center", marginTop: 12 },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  muted: { color: "#777", fontSize: 12 },
  resolvedName: { fontSize: 16, fontWeight: "700", marginVertical: 2 },
  error: { color: "#d33", fontSize: 13 },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  btn: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center" },
  cancel: { backgroundColor: "#eee" },
  confirm: { backgroundColor: "#111" },
  picker: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#fff", gap: 10 },
  bankRow: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
});