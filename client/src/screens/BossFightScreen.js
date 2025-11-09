import { fetchCharacterData, attackBoss, fetchCurrentBoss } from "../api";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Animated } from 'react-native';

export default function BossFightScreen() {
    const [boss, setBoss] = useState(null);
    const [bossDefeated, setBossDefeated] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0); // Will be set from boss.fightTimeLimit
    const [nextBossTime, setNextBossTime] = useState(null);
    const [fightModalVisible, setFightModalVisible] = useState(false);
    const [playerHP, setPlayerHP] = useState(100);
    const [maxPlayerHP, setMaxPlayerHP] = useState(100);
    const [playerStats, setPlayerStats] = useState(null);
    const [showMiss, setShowMiss] = useState(false);
    const [showDamage, setShowDamage] = useState(null);
    const [showRewards, setShowRewards] = useState(false);
    const [rewards, setRewards] = useState(null);
    const [damageAnim] = useState(new Animated.Value(1));
    const [lastBossAttack, setLastBossAttack] = useState(0);

    useEffect(() => {
        loadBoss();
        loadPlayerStats();
        calculateNextBoss();
    }, []);

    useEffect(() => {
        if (!fightModalVisible || !boss) return;
        if (timeLeft <= 0) {
            closeFight();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(t => t - 1);
            checkBossAttack();
        }, 1000);
        return () => clearInterval(timer);
    }, [fightModalVisible, timeLeft, boss]);

    const loadPlayerStats = async () => {
        const data = await fetchCharacterData();
        if (data) {
            setPlayerStats(data.stats);
            const calculatedMaxHP = 100 + (data.stats.endurance * 2);
            setMaxPlayerHP(calculatedMaxHP);
        }
    };

    const calculatePlayerDamage = () => {
        if (!playerStats) return 20;
        const baseDamage = 10 + (playerStats.strength * 1.5);
        const critChance = playerStats.intelligence / 200; // Up to 50 percent crit
        const isCrit = Math.random() < critChance;
        return Math.floor(baseDamage * (isCrit ? 1.5 : 1));
    };

    const calculateHitChance = () => {
        if (!playerStats) return 0.8;
        return Math.min(0.95, 0.7 + (playerStats.intelligence / 5000));
    };

    const checkBossAttack = () => {
        if (!boss) return;
        const currentTime = Date.now();
        const attackInterval = calculateBossAttackInterval(boss);

        if (currentTime - lastBossAttack >= attackInterval) {
            performBossAttack();
            setLastBossAttack(currentTime);
        }
    };

    const calculateBossAttackInterval = (boss) => {
        const baseInterval = 10000;
        const intelligenceFactor = boss.stats?.intelligence || 50;
        return Math.max(3000, baseInterval - (intelligenceFactor * 50));
    };

    const calculateBossAttackDamage = (boss) => {
        const baseStrength = boss.stats?.strength || 50;
        const rawDamage = Math.floor(5 + (baseStrength * 0.3));
    
        if (!playerStats) return rawDamage;
        const damageReduction = playerStats.endurance / 200; // 0-50% reduction
        return Math.floor(rawDamage * (1 - damageReduction));
    };  

    const performBossAttack = () => {
        const damage = calculateBossAttackDamage(boss);
        setPlayerHP(prev => Math.max(0, prev - damage));
        // Maybe add visual later if time
    };

    const loadBoss = async () => {
        const bossData = await fetchCurrentBoss();
        if (bossData) {
            setBoss(bossData);
            setBossDefeated(bossData.hp <= 0);
        } else {
            setBossDefeated(true);
        }
    };

    const calculateNextBossTime = () => {
        const now = new Date();
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7 || 7);
        nextMonday.setHours(0, 1, 0, 0);
        setNextBossTime(nextBossTime);
    };

    const getTimeUntilNextBoss = () => {
        if (!nextBossTime) return '';
        const now = new Date();
        const diff = nextBossTime - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${days}d ${hours}h ${minutes}m`;
    };

    const startFight = () => {
        if (!boss) return;
        setTimeLeft(boss.fightTimeLimit || 60); // 1 min default
        setPlayerHP(maxPlayerHP);
        setLastBossAttack(Date.now());
        setFightModalVisible(true);
    };

    const closeFight = () => {
        setFightModalVisible(false);
        setShowRewards(false);
    };

    const handleAttack = async () => {
        if (timeLeft <= 0 || playerHP <= 0 || boss.hp <= 0) return;

        Animated.sequence([
            Animated.timing(damageAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
            Animated.timing(damageAnim, { toValue: 1.05, duration: 50, useNativeDriver: true }),
            Animated.timing(damageAnim, { toValue: 1, duration: 50, useNativeDriver: true })
        ]).start();

        const hitChance = calculateHitChance();
        const hit = Math.random() < hitChance;
        
        if (hit) {
            const damage = calculatePlayerDamage();
            setShowDamage(damage);
            
            // Send attack to server
            const result = await attackBoss(damage);
            setBoss({ ...boss, hp: Math.max(0, boss.hp - damage) });
            
            setTimeout(() => setShowDamage(null), 800);

            if (boss.hp - damage <= 0) {
                setTimeout(() => {
                    setShowRewards(true);
                    setRewards(result.rewards || { xp: 500, stats: { strength: 5 } });
                }, 1000);
            }
        } else {
            setShowMiss(true);
            setTimeout(() => setShowMiss(false), 600);
        }
    };

    if (bossDefeated) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>WALKBOUND</Text>
                </View>

                <View style={styles.defeatedCard}>
                    <Text style={styles.defeatedIcon}>🏆</Text>
                    <Text style={styles.defeatedTitle}>BOSS DEFEATED</Text>
                    <Text style={styles.defeatedSubtitle}>The realm is safe... for now</Text>
                    
                    <View style={styles.countdownCard}>
                        <Text style={styles.countdownLabel}>NEXT BOSS ARRIVES IN</Text>
                        <Text style={styles.countdownTime}>{getTimeUntilNextBoss()}</Text>
                        <Text style={styles.countdownDate}>Monday at 12:01 AM</Text>
                    </View>

                    <Text style={styles.motivationText}>
                        Keep training! Walk more steps to strengthen your character for the next battle.
                    </Text>
                </View>
            </View>
        );
    }

    // View 1: Active Boss - Not Yet Defeated
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>WALKBOUND</Text>
                <Text style={styles.subtitle}>Weekly Boss Challenge</Text>
            </View>

            {boss && (
                <>
                    <View style={styles.bossCard}>
                        <View style={styles.bossImageContainer}>
                            <Image 
                                source={require('../assets/bosses/boss_1.png')}
                                style={styles.bossImage}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.bossName}>{boss.name}</Text>
                        
                        {/* Boss Special Ability */}
                        <View style={styles.bossNote}>
                            <Text style={styles.bossNoteLabel}>⚠️ BOSS TRAIT</Text>
                            <Text style={styles.bossNoteText}>{boss.specialAbility || "Increased Strength"}</Text>
                        </View>

                        {/* Boss HP Bar */}
                        <View style={styles.hpSection}>
                            <Text style={styles.hpLabel}>BOSS HEALTH</Text>
                            <View style={styles.hpBar}>
                                <View style={[styles.hpFill, { width: `${(boss.hp / boss.maxHp) * 100}%` }]} />
                            </View>
                            <Text style={styles.hpText}>
                                {boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()}
                            </Text>
                        </View>

                        {/* Power Ranking */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Your Power</Text>
                                <Text style={styles.infoValue}>15.3</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Boss Power</Text>
                                <Text style={styles.infoValue}>{boss.powerRank || "18.5"}</Text>
                            </View>
                        </View>

                        {/* Time Until Expires */}
                        <View style={styles.expirySection}>
                            <Text style={styles.expiryLabel}>⏰ BOSS EXPIRES IN</Text>
                            <Text style={styles.expiryTime}>2d 14h 23m</Text>
                        </View>

                        {/* Fight Button */}
                        <TouchableOpacity style={styles.fightButton} onPress={startFight}>
                            <Text style={styles.fightButtonText}>⚔️ ENGAGE BOSS</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Fight Modal */}
                    <Modal
                        visible={fightModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={closeFight}
                    >
                        <View style={styles.modalOverlay}>
                            <Animated.View style={[styles.modalContent, { transform: [{ scale: damageAnim }] }]}>
                                {!showRewards ? (
                                    <>
                                        {/* Fight Timer */}
                                        <View style={styles.fightTimer}>
                                            <Text style={styles.timerText}>
                                                ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                            </Text>
                                            <TouchableOpacity onPress={closeFight} style={styles.closeBtn}>
                                                <Text style={styles.closeBtnText}>✕</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Battle Arena */}
                                        <TouchableOpacity 
                                            style={styles.battleArena}
                                            onPress={handleAttack}
                                            activeOpacity={0.9}
                                        >
                                            {/* Boss */}
                                            <View style={styles.battleBossSection}>
                                                <Image 
                                                    source={require('../assets/bosses/boss_1.png')}
                                                    style={styles.battleBossImage}
                                                    resizeMode="contain"
                                                />
                                                <View style={styles.battleHpBar}>
                                                    <View style={[styles.battleHpFill, { width: `${(boss.hp / boss.maxHp) * 100}%` }]} />
                                                </View>
                                            </View>

                                            {/* Damage/Miss Text */}
                                            {showDamage && (
                                                <View style={styles.damagePopup}>
                                                    <Text style={styles.damageText}>-{showDamage}</Text>
                                                </View>
                                            )}
                                            {showMiss && (
                                                <View style={styles.missPopup}>
                                                    <Text style={styles.missText}>MISS!</Text>
                                                </View>
                                            )}

                                            {/* Player (back view) */}
                                            <View style={styles.battlePlayerSection}>
                                                <Image 
                                                    source={require('../assets/characters/warrior_back.png')}
                                                    style={styles.battlePlayerImage}
                                                    resizeMode="contain"
                                                />
                                                <View style={styles.battlePlayerHpBar}>
                                                    <View style={[styles.battlePlayerHpFill, { width: `${(playerHP / maxPlayerHP) * 100}%` }]} />
                                                </View>
                                                <Text style={styles.battlePlayerHp}>{playerHP} / {maxPlayerHP} HP</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <Text style={styles.tapHint}>TAP TO ATTACK</Text>
                                    </>
                                ) : (
                                    // Rewards Screen
                                    <View style={styles.rewardsContainer}>
                                        <Text style={styles.rewardsTitle}>🏆 VICTORY! 🏆</Text>
                                        <Text style={styles.rewardsSubtitle}>Boss Defeated!</Text>
                                        
                                        <View style={styles.rewardsList}>
                                            <View style={styles.rewardItem}>
                                                <Text style={styles.rewardLabel}>XP Gained</Text>
                                                <Text style={styles.rewardValue}>+{rewards?.xp || 500}</Text>
                                            </View>
                                            {rewards?.stats && Object.entries(rewards.stats).map(([stat, value]) => (
                                                <View key={stat} style={styles.rewardItem}>
                                                    <Text style={styles.rewardLabel}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</Text>
                                                    <Text style={styles.rewardValue}>+{value}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        <TouchableOpacity style={styles.claimButton} onPress={closeFight}>
                                            <Text style={styles.claimButtonText}>CLAIM REWARDS</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </Animated.View>
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#2b2416' },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#d4af37'
    },
    title: { 
        fontSize: 36, 
        fontWeight: 'bold', 
        color: '#d4af37',
        letterSpacing: 4,
        textShadowColor: '#000',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    subtitle: { fontSize: 14, color: '#8b7355', letterSpacing: 2, marginTop: 5 },

    // Boss Card (View 1)
    bossCard: {
        backgroundColor: '#1a1410',
        margin: 20,
        borderRadius: 15,
        padding: 20,
        borderWidth: 3,
        borderColor: '#8b0000'
    },
    bossImageContainer: {
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#0f0c08',
        borderRadius: 10,
        padding: 20,
        borderWidth: 2,
        borderColor: '#d4af37'
    },
    bossImage: { width: 150, height: 150 },
    bossName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ff4444',
        textAlign: 'center',
        marginBottom: 15,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3
    },
    bossNote: {
        backgroundColor: '#2a0a0a',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ff4444',
        marginBottom: 15
    },
    bossNoteLabel: { fontSize: 10, color: '#ff8888', fontWeight: 'bold', marginBottom: 3 },
    bossNoteText: { fontSize: 14, color: '#fff', fontStyle: 'italic' },
    
    // HP Section
    hpSection: { marginBottom: 15 },
    hpLabel: { fontSize: 12, color: '#8b7355', fontWeight: 'bold', marginBottom: 8 },
    hpBar: {
        height: 24,
        backgroundColor: '#0f0c08',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#4a3829'
    },
    hpFill: { height: '100%', backgroundColor: '#ff4444' },
    hpText: { fontSize: 14, color: '#fff', textAlign: 'center', marginTop: 5 },

    // Info Row
    infoRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    infoBox: {
        flex: 1,
        backgroundColor: '#0f0c08',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4a3829'
    },
    infoLabel: { fontSize: 11, color: '#8b7355', marginBottom: 5 },
    infoValue: { fontSize: 20, fontWeight: 'bold', color: '#4a9eff' },

    // Expiry
    expirySection: {
        backgroundColor: '#2a1810',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#d4af37'
    },
    expiryLabel: { fontSize: 11, color: '#d4af37', fontWeight: 'bold', marginBottom: 3 },
    expiryTime: { fontSize: 20, fontWeight: 'bold', color: '#fff' },

    // Fight Button
    fightButton: {
        backgroundColor: '#8b0000',
        padding: 18,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: '#d4af37'
    },
    fightButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 2
    },

    // Defeated View (View 2)
    defeatedCard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    defeatedIcon: { fontSize: 80, marginBottom: 20 },
    defeatedTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#d4af37',
        letterSpacing: 3,
        marginBottom: 10
    },
    defeatedSubtitle: { fontSize: 16, color: '#8b7355', marginBottom: 40, fontStyle: 'italic' },
    countdownCard: {
        backgroundColor: '#1a1410',
        padding: 30,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: '#d4af37',
        alignItems: 'center',
        marginBottom: 30,
        width: '100%'
    },
    countdownLabel: { fontSize: 12, color: '#8b7355', fontWeight: 'bold', marginBottom: 10 },
    countdownTime: { fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
    countdownDate: { fontSize: 14, color: '#4a9eff' },
    motivationText: { fontSize: 14, color: '#8b7355', textAlign: 'center', paddingHorizontal: 20, fontStyle: 'italic' },

    // Fight Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#1a1410',
        borderRadius: 15,
        borderWidth: 3,
        borderColor: '#d4af37',
        overflow: 'hidden'
    },
    fightTimer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0f0c08',
        padding: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#d4af37'
    },
    timerText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    closeBtn: { padding: 5 },
    closeBtnText: { fontSize: 24, color: '#8b7355' },

    // Battle Arena
    battleArena: {
        height: 450,
        position: 'relative'
    },
    battleBossSection: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    battleBossImage: { width: 120, height: 120, marginBottom: 10 },
    battleHpBar: {
        width: '80%',
        height: 16,
        backgroundColor: '#0f0c08',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#4a3829'
    },
    battleHpFill: { height: '100%', backgroundColor: '#ff4444' },

    battlePlayerSection: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    battlePlayerImage: { width: 100, height: 100, marginBottom: 10 },
    battlePlayerHpBar: {
        width: '60%',
        height: 12,
        backgroundColor: '#0f0c08',
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#4a3829',
        marginBottom: 5
    },
    battlePlayerHpFill: { height: '100%', backgroundColor: '#4a9eff' },
    battlePlayerHp: { fontSize: 14, color: '#fff', fontWeight: 'bold' },

    // Damage/Miss Popups
    damagePopup: {
        position: 'absolute',
        top: '35%',
        alignSelf: 'center'
    },
    damageText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ff4444',
        textShadowColor: '#000',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    missPopup: {
        position: 'absolute',
        top: '40%',
        alignSelf: 'center'
    },
    missText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#888',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3
    },

    tapHint: {
        fontSize: 14,
        color: '#d4af37',
        textAlign: 'center',
        padding: 15,
        fontWeight: 'bold',
        letterSpacing: 2
    },

    // Rewards
    rewardsContainer: {
        padding: 30,
        alignItems: 'center'
    },
    rewardsTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#d4af37',
        marginBottom: 10,
        textAlign: 'center'
    },
    rewardsSubtitle: { fontSize: 18, color: '#8b7355', marginBottom: 30 },
    rewardsList: { width: '100%', marginBottom: 30 },
    rewardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#0f0c08',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#d4af37'
    },
    rewardLabel: { fontSize: 16, color: '#8b7355', fontWeight: 'bold' },
    rewardValue: { fontSize: 18, color: '#4a9eff', fontWeight: 'bold' },
    claimButton: {
        backgroundColor: '#d4af37',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#8b4513'
    },
    claimButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1410',
        letterSpacing: 2
    }
});