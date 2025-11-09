import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { createClient } from "@supabase/supabase-js";
import { useNavigation } from "@react-navigation/native";
import { signIn, register } from "../api";

const supabaseUrl = env.supabaseUrl; //change this
const supabaseAnonKey = env.supabaseAnonKey; //change this
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AuthPage() {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigation = useNavigation();

    const handleAuth = async () => {
        setMessage("");

        if (!email || !password) {
            setMessage("Please enter your email and password.");
            return;
        }
    
        try {
            setLoading(true);

            if (mode === "login") {
                signIn(email, password);
            } else {
                // const { error } = await supabase.auth.signUp({ email, password });
                // if (error) throw error;
                // setMessage("Check your inbox to verify your email!"); //it says that email confirmation is default in supabase but if not used can be deleted
                register(email, password, username || null);
            }

            navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
            });
        } catch (err) {
            setMessage("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{mode === "login" ? "Login" : "Create Account"}</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
            />

            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />

            if (mode === 'Sign Up') {
                <TextInput
                    placeholder="Name"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    secureTextEntry
                />
            }

            <TouchableOpacity onPress={handleAuth} disabled={loading} style={styles.button}>
                <Text style={styles.buttonText}>
                {loading
                    ? mode === "login"
                    ? "Logging in..."
                    : "Signing up..."
                    : mode === "login"
                    ? "Login"
                    : "Sign Up"}
                </Text>
            </TouchableOpacity>

            {message ? <Text style={styles.message}>{message}</Text> : null}

            <Text style={styles.toggle} onPress={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "Sign up" : "Log in"}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0B0C",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: { color: "white", fontSize: 24, marginBottom: 20 },
    input: {
        backgroundColor: "#2C2C2E",
        color: "white",
        padding: 12,
        borderRadius: 6,
        width: "100%",
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#2132ceff",
        padding: 12,
        borderRadius: 6,
        width: "100%",
        alignItems: "center",
    },
    buttonText: { color: "white", fontWeight: "600" },
    message: { color: "white", marginTop: 10 },
    toggle: { color: "#2132ceff", marginTop: 15 },
});