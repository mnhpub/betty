import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ApiUser } from "../lib/api";

export default function HomeScreen({
  user,
  onLogout,
}: {
  user: ApiUser;
  onLogout: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}</Text>
      <Text style={styles.subtitle}>{user.email}</Text>
      <TouchableOpacity style={styles.button} onPress={onLogout}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", gap: 12 },
  title: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 16, color: "#666" },
  button: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  buttonText: { fontWeight: "600" },
});
