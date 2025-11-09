import React, { useEffect, useState } from "react";
import {View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal,} from "react-native";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = env.SURL; // change this
const supabaseAnonKey = env.SBK; // change this
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LeaderboardPage() {
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchFriends = async () => {
            const { data, error } = await supabase
                .from("friends") // this needs to match the table name
                .select("id, name, icon_url, score, steps_today, str, int, sta") // this is based of of what the table possibly looks like
                .order("score", { ascending: false });

            if (error) {
                console.error(error);
            } else {
                setFriends(data);
            }
        };

        fetchFriends();
    }, []);

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => {
                setSelectedFriend(item);
                setModalVisible(true);
            }}
        >
            <View style={styles.row}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image source={{ uri: item.icon_url }} style={styles.icon} />
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.score}>{item.score}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Friends Leaderboard</Text>
            <FlatList
                data={friends}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedFriend && (
                            <>
                                <Image
                                    source={{ uri: selectedFriend.icon_url }}
                                    style={styles.modalPic}
                                />
                                <Text style={styles.modalName}>{selectedFriend.name}</Text>
                                <Text style={styles.modalSteps}>
                                    Steps today: {selectedFriend.steps_today}
                                </Text>
                                <Text style={styles.modalStats}>
                                    Str: {selectedFriend.str} | Int: {selectedFriend.int} | Sta:{" "}
                                    {selectedFriend.sta}
                                </Text>

                                <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                                >
                                <Text style={{ color: "white" }}>Close</Text>
                                </TouchableOpacity>
                            </>
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
        padding: 20,
    },
    title: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1B1B1D",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    rank: { color: "white", fontSize: 18, width: 30, textAlign: "center" },
    icon: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    name: { color: "white", fontSize: 16, flex: 1 },
    score: { color: "#2132ceff", fontSize: 16, fontWeight: "600" },

    
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