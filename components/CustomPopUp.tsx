import { View, Text, Modal, Pressable } from 'react-native'
import React,{useState} from 'react'
// this is animated
// while this is visible  morengoaid screen should be disabled
// user can't cancel popup until it's finished

interface CustomPopUpProps {
  message?: string;
  title?: string;
  trigger?: boolean;
}

const CustomPopUp = ({ message = "", title = "Popup", trigger = false }: CustomPopUpProps) => {
  const [visible, setVisible] = useState(false);

  return (
    // <View>
    //   <Text>Hmmm, let's see, 
    //     {'outline fomat like .____'}
    //     {'better language bruh'}
    //     1. The problem might be the structure of the searches
    //     {'sub outline detailing the right way to search with examples'}
    //     . instead of writing ''''
    //     . start centences with {"class of words, i dont'if it's prepositions"} like what is, who is, where is
    //     . rthgrnhfgn ''''

    //     2.If you aren't satisfied, will you be opposed to providing corrections to improve future responses
    //   </Text>
    //    {' 2nd pop up box  untop of first but not fully, just at the edge, first becomes blured'}

    //    <Text>
    //     {'animated'}
    //      learn about morengo points system

    //      users gain points based on helpful feedback and corrections they provide

    //      points can be redeemed in morengofoods, as free delivery coupons
    //    </Text>

    // </View>


      <>
      <Pressable onPress={() => setVisible(true)}>
        <Text>Open popup</Text>
      </Pressable>

      <Modal transparent animationType="fade" visible={visible}>
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <View style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 12,
            width: "80%"
          }}>
            <Text>Hello popup 👋</Text>

            <Pressable onPress={() => setVisible(false)}>
              <Text>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  )
}

export default CustomPopUp