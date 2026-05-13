import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>

      <Text style={styles.text}>
        Login successful. Welcome!
      </Text>

      <Button
        title="Open Food Journal"
        onPress={() => navigation.navigate("Journal")}
      />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Logout"
          color="red"
          onPress={() => navigation.navigate("Auth")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },

  text: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 18,
  },
});