import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Please enter email and password");
        return;
      }

      const usersJson = await AsyncStorage.getItem("users");
      const users = usersJson ? JSON.parse(usersJson) : [];

      const exists = users.find((u) => u.email === email);

      if (exists) {
        Alert.alert("Error", "User already exists");
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
      };

      users.push(newUser);

      await AsyncStorage.setItem("users", JSON.stringify(users));

      Alert.alert("Success", "Account created successfully");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Register failed");
    }
  };

  const handleLogin = async () => {
    try {
      const usersJson = await AsyncStorage.getItem("users");
      const users = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Invalid email or password");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Register" onPress={handleRegister} />

      <View style={{ marginTop: 10 }}>
        <Button title="Login" onPress={handleLogin} />
      </View>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});