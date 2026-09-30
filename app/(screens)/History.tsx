import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---- Design tokens (matches existing delivery-app language) ----
const COLORS = {
  bg: "#09090b",          // zinc-950
  surface: "#18181b",     // zinc-900
  surfaceAlt: "#27272a",  // zinc-800
  border: "#3f3f46",      // zinc-700
  textPrimary: "#fafafa", // zinc-50
  textSecondary: "#a1a1aa", // zinc-400
  textMuted: "#71717a",   // zinc-500
  orange: "#f97316",
  orangeMuted: "#fb923c",
  success: "#22c55e",
  successBg: "rgba(34,197,94,0.12)",
  pending: "#eab308",
  pendingBg: "rgba(234,179,8,0.12)",
  failed: "#ef4444",
  failedBg: "rgba(239,68,68,0.12)",
};

const FONT = {
  heading: "Crispy", // fallback to system if not loaded
  body: "Nunito",
  bodyBold: "Nunito-Bold",
  bodySemi: "Nunito-SemiBold",
};

const STATUS_META = {
  success: { label: "Paid", color: COLORS.success, bg: COLORS.successBg },
  completed: { label: "Paid", color: COLORS.success, bg: COLORS.successBg },
  pending: { label: "Pending", color: COLORS.pending, bg: COLORS.pendingBg },
  processing: { label: "Processing", color: COLORS.pending, bg: COLORS.pendingBg },
  failed: { label: "Failed", color: COLORS.failed, bg: COLORS.failedBg },
  retrying: { label: "Retrying", color: COLORS.failed, bg: COLORS.failedBg },
};

const ROLE_META = {
  vendor: { label: "Vendor", color: COLORS.orangeMuted },
  rider: { label: "Rider", color: "#60a5fa" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "success", label: "Paid" },
  { key: "failed", label: "Failed" },
];

function formatNaira(amountKobo, currency = "NGN") {
  const value = (amountKobo || 0) / 100;
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₦${value.toFixed(2)}`;
  }
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + " · " + d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    label: status || "Unknown",
    color: COLORS.textMuted,
    bg: COLORS.surfaceAlt,
  };
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

function RoleTag({ role }) {
  const meta = ROLE_META[role] || { label: role || "—", color: COLORS.textMuted };
  return (
    <View style={styles.roleTag}>
      <Text style={[styles.roleTagText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

function PayoutCard({ item, onPress }) {
  const isFailed = item.status === "failed" || item.status === "retrying";
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardTopLeft}>
          <Text style={styles.amount}>
            {formatNaira(item.amountKobo, item.currency)}
          </Text>
          <RoleTag role={item.role} />
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Order</Text>
        <Text style={styles.metaValue} numberOfLines={1}>
          #{item.orderId}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Reference</Text>
        <Text style={styles.metaValue} numberOfLines={1}>
          {item.paystackReference || item.paystackTransferCode || "—"}
        </Text>
      </View>

      {isFailed && item.failureReason ? (
        <View style={styles.failureBox}>
          <Text style={styles.failureText} numberOfLines={2}>
            {item.failureReason}
          </Text>
          {item.retryCount ? (
            <Text style={styles.retryText}>Retries: {item.retryCount}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {formatDate(item.processedAt || item.scheduledAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * PayoutHistory
 *
 * Props:
 * - payouts: array of payout documents (see field shape below)
 * - loading: bool — initial load spinner
 * - refreshing: bool — pull-to-refresh spinner
 * - onRefresh: () => void
 * - onPayoutPress: (payout) => void
 * - onLoadMore: () => void — pagination hook, called near list end
 *
 * Expected payout document shape (Appwrite):
 * { orderId, recipientUserId, role, recipientCode, amountKobo, currency,
 *   status, paystackTransferCode, paystackReference, failureReason,
 *   retryCount, scheduledAt, processedAt }
 */
export default function PayoutHistory({
  payouts = [],
  loading = false,
  refreshing = false,
  onRefresh,
  onPayoutPress,
  onLoadMore,
}) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = useMemo(() => {
    if (activeFilter === "all") return payouts;
    if (activeFilter === "success") {
      return payouts.filter((p) => p.status === "success" || p.status === "completed");
    }
    if (activeFilter === "failed") {
      return payouts.filter((p) => p.status === "failed" || p.status === "retrying");
    }
    return payouts.filter((p) => p.status === activeFilter);
  }, [payouts, activeFilter]);

  const totalPaid = useMemo(() => {
    return payouts
      .filter((p) => p.status === "success" || p.status === "completed")
      .reduce((sum, p) => sum + (p.amountKobo || 0), 0);
  }, [payouts]);

  const renderItem = useCallback(
    ({ item }) => <PayoutCard item={item} onPress={onPayoutPress} />,
    [onPayoutPress]
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payout History</Text>
        <Text style={styles.headerSubtitle}>
          Total paid out: {formatNaira(totalPaid)}
        </Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={COLORS.orange} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerFill}>
          <Text style={styles.emptyTitle}>No payouts yet</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === "all"
              ? "Payouts will show up here once processed."
              : "Nothing matches this filter."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, idx) =>
            item.$id || item.paystackReference || String(idx)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={onLoadMore}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.orange}
              colors={[COLORS.orange]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: FONT.heading,
    fontSize: 26,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  filterChipText: {
    fontFamily: FONT.bodySemi,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: "#09090b",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardTopLeft: {
    flexDirection: "column",
  },
  amount: {
    fontFamily: FONT.bodyBold,
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleTag: {
    alignSelf: "flex-start",
  },
  roleTagText: {
    fontFamily: FONT.bodySemi,
    fontSize: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: FONT.bodySemi,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  metaLabel: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  metaValue: {
    fontFamily: FONT.bodySemi,
    fontSize: 13,
    color: COLORS.textSecondary,
    maxWidth: "65%",
    textAlign: "right",
  },
  failureBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.failedBg,
  },
  failureText: {
    fontFamily: FONT.body,
    fontSize: 12,
    color: COLORS.failed,
  },
  retryText: {
    fontFamily: FONT.body,
    fontSize: 11,
    color: COLORS.failed,
    marginTop: 4,
    opacity: 0.8,
  },
  cardFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
  },
  dateText: {
    fontFamily: FONT.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: FONT.bodyBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});