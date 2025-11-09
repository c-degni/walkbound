import React, { useEffect, useState } from "react";
import {View, Text, Image, StyleSheet, TouchableOpacity, Modal,} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { useNavigation } from "@react-navigation/native";

const supabaseUrl = "https://YOUR-PROJECT-URL.supabase.co"; // change this
const supabaseAnonKey = "YOUR-ANON-KEY"; // change this
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UserProfilePage() {
    const [userData, setUserData] = useState(null);
    const [modalVisible, setModalVisible] = useState(true); 
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user }
            } = await supabase.auth.getUser();

            if (user) {
                
                const { data, error } = await supabase
                .from("friends") // needs to match the table 
                .select("id, name, icon_url, steps_today, str, int, sta") // needs to match the columns
                .eq("id", user.id) 
                .single();

                if (error) {
                    console.error(error);
                } else {
                    setUserData(data);
                }
            }
        };

        fetchUser();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Profile</Text>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {userData ? (
                            <>
                                <Image
                                    source={{ uri: userData.icon_url }}
                                    style={styles.modalPic}
                                />
                                <Text style={styles.modalName}>{userData.name}</Text>
                                <Text style={styles.modalSteps}>
                                    Steps today: {userData.steps_today}
                                </Text>
                                <Text style={styles.modalStats}>
                                    Str: {userData.str} | Int: {userData.int} | Sta: {userData.sta}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => navigation.navigate("Home")}
                                    style={styles.closeButton}
                                >
                                    <Text style={{ color: "white" }}>Back to Home</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={{ color: "white" }}>Loading...</Text>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0B0C",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#1B1B1D",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalPic: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
    modalName: { color: "white", fontSize: 20, marginBottom: 5 },
    modalSteps: { color: "white", fontSize: 16, marginBottom: 10 },
    modalStats: { color: "#2132ceff", fontSize: 16, marginBottom: 20 },
    closeButton: {
        backgroundColor: "#2132ceff",
        padding: 10,
        borderRadius: 6,
    },
});