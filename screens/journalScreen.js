import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as SQLite from "expo-sqlite";

export default function JournalScreen() {
  const [db, setDb] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [journals, setJournals] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      const database = await SQLite.openDatabaseAsync("FoodJournal.db");
      setDb(database);

      await database.execAsync(`
        DROP TABLE IF EXISTS journals;

        CREATE TABLE journals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          image TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL
        );
      `);

      await loadJournals(database);
    } catch (error) {
      console.log("DB Init Error:", error);
      Alert.alert("Database Error", error.message);
    }
  };

  const loadJournals = async (database = db) => {
    try {
      if (!database) return;

      const data = await database.getAllAsync(
        "SELECT * FROM journals ORDER BY id DESC"
      );

      setJournals(data);
    } catch (error) {
      console.log("Load Error:", error);
      Alert.alert("Load Error", error.message);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Image Error", error.message);
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission needed", "Camera permission is required.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Camera Error", error.message);
    }
  };

  const saveJournal = async () => {
    try {
      if (!db) {
        Alert.alert("Database not ready", "Please wait and try again.");
        return;
      }

      if (!image || !description.trim() || !category.trim()) {
        Alert.alert(
          "Missing data",
          "Please add image, description, and category."
        );
        return;
      }

      const today = new Date().toLocaleDateString();

      if (editingId) {
        await db.runAsync(
          "UPDATE journals SET image = ?, description = ?, category = ?, date = ? WHERE id = ?",
          [image, description.trim(), category.trim(), today, editingId]
        );
      } else {
        await db.runAsync(
          "INSERT INTO journals (image, description, category, date) VALUES (?, ?, ?, ?)",
          [image, description.trim(), category.trim(), today]
        );
      }

      setImage(null);
      setDescription("");
      setCategory("");
      setEditingId(null);

      await loadJournals(db);

      Alert.alert("Success", "Journal saved successfully.");
    } catch (error) {
      console.log("Save Error:", error);
      Alert.alert("Save Error", error.message);
    }
  };

  const editJournal = async (item) => {
  setImage(item.image);
  setDescription(item.description);
  setCategory(item.category);

  await db.runAsync(
    "DELETE FROM journals WHERE id = ?;",
    [item.id]
  );

  loadJournals();

  Alert.alert(
    "Edit Mode",
    "Journal loaded for editing."
  );
};

  const deleteJournal = async (id) => {
    try {
      if (!db) return;

      await db.runAsync("DELETE FROM journals WHERE id = ?", [id]);
      await loadJournals(db);

      Alert.alert("Deleted", "Journal deleted successfully.");
    } catch (error) {
      console.log("Delete Error:", error);
      Alert.alert("Delete Error", error.message);
    }
  };

  const categories = ["All", ...new Set(journals.map((item) => item.category))];

  const filteredJournals =
    filter === "All"
      ? journals
      : journals.filter((item) => item.category === filter);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Food Journal</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.blueBtn} onPress={pickImage}>
          <Text style={styles.btnText}>Choose Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.greenBtn} onPress={takePhoto}>
          <Text style={styles.btnText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <TextInput
        placeholder="Food description"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        placeholder="Category: Breakfast, Lunch, Dinner"
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveJournal}>
        <Text style={styles.btnText}>
          {editingId ? "Update Journal" : "Add Journal"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Filter by Category</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterBtn, filter === cat && styles.activeFilter]}
            onPress={() => setFilter(cat)}
          >
            <Text style={styles.filterText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredJournals}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />

            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.category}>Category: {item.category}</Text>
            <Text style={styles.date}>Date: {item.date}</Text>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => editJournal(item)}
            >
              <Text style={styles.btnText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteJournal(item.id)}
            >
              <Text style={styles.btnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  blueBtn: {
    flex: 1,
    backgroundColor: "#2196f3",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  greenBtn: {
    flex: 1,
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveBtn: {
    backgroundColor: "#2196f3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#333",
    padding: 12,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "white",
  },

  imagePreview: {
    width: "100%",
    height: 220,
    marginVertical: 10,
    borderRadius: 12,
  },

  filterBtn: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },

  activeFilter: {
    backgroundColor: "#2196f3",
  },

  filterText: {
    fontWeight: "bold",
  },

  card: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "white",
  },

  cardImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },

  desc: {
    fontSize: 17,
    marginBottom: 5,
  },

  category: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  date: {
    color: "gray",
    marginBottom: 10,
  },

  editBtn: {
    backgroundColor: "orange",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});