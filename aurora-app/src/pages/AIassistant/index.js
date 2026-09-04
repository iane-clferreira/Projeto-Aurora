import { View, Text } from "react-native";
import { StyleSheet } from "react-native";

export default function AIassistant(){
    return(
        <View style={styles.container}>
            <Text>AI Assistant Page</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});