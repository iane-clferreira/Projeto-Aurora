import { View, Text } from "react-native"
import { StyleSheet } from "react-native";
export default function FileAdapter(){
    return(
        <View style={styles.container}>
            <Text>File Adapter Page</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});