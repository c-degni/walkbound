import { ScrollView } from "react-native-gesture-handler";
import { fetchCharacterData, syncStepsToServer } from "../api";

export default function HomeScreen () {
    const [stepsToday, setStepsToday] = useState(0);
    const [stepRate, setStepRate] = useState(0);
    const [focusedStat, setFocusedStat] = useState(null);
    const [character, setCharacter] = useState({
        level: 1,
        powerRanking: 0,
        stats: { strength: 10, intelligence: 10, endurance: 10 }
    });

    useEffect(() => {
        fetchSteps();
        loadCharacter();
        const interval = setInterval(fetchSteps, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchSteps = () => {
        const options = {
            date: new Date().toISOString(),
            includeManuallyAdded: false
        };

        AppleHealthKit.getStepCount(options, (err, results) => {
            if (!err) {
                setStepsToday(results.value);
                calculateStepRate(results.value);
                syncStepsToServer(results.value);
            }
        });
    };

    const calculateStepRate = (steps) => {
        const now = new Date();
        const hoursSinceMidnight = now.getHours() + now.getMinutes() / 60;
        setStepRate(Math.round(steps / (hoursSinceMidnight || 1)));
    };

    const loadCharacter = async () => {
        const data = await fetchCharacterData();
        if (data) setCharacter(data);
    };

    const setDailyFocus = (stat) => {
        setDailyFocus(stat);
        // TODO: SEND TO THE BACKEND (J AND Z!!)
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>WALKBOUND</Text>
                <Text style={styles.subtitle}>Today's Quest</Text>
            </View>

            {/* Character Preview */}
            <View style={styles.characterCard}>
                <View style={styles.characterHeader}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>⚔️</Text>
                    </View>

                    <View style={styles.characterInfo}>
                        <Text style={styles.characterName}>Warrior</Text>
                        <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>Lv. {character.level}</Text>
                    </View>

                    <View style={styles.powerRow}>
                        <Text style={styles.powerLabel}>Power Rank:</Text>
                        <Text style={styles.powerValue}>{character.powerRanking.toFixed(1)}</Text>
                    </View>
                    </View>
                </View>
            </View>

            {/* Quick Stats Preview */}
            <View style={styles.quickStats}>
                <StatPill icon="⚔️" value={character.stats.strength} color="#d4af37" />
                <StatPill icon="🧙" value={character.stats.intelligence} color="#4a9eff" />
                <StatPill icon="🛡️" value={character.stats.endurance} color="#8b4513" />
            </View>

            {/* Steps Card - Main Focus */}
            <View style={styles.stepCard}>
                <View style={styles.stepHeader}>
                    <Text style={styles.stepLabel}>STEPS TODAY</Text>
                    <Text style={styles.stepRate}>📈 {stepRate}/hr</Text>
                </View>
                <Text style={styles.stepCount}>{todaySteps.toLocaleString()}</Text>
                <View style={styles.stepProgress}>
                    <View style={[styles.stepProgressFill, { width: `${Math.min((todaySteps / 10000) * 100, 100)}%` }]} />
                </View>
                <Text style={styles.stepGoal}>Goal: 8,000</Text>
            </View>

            {/* Daily Stat Focus */}
            <View style={styles.focusSection}>
                <Text style={styles.sectionTitle}>⚡ DAILY FOCUS</Text>
                <Text style={styles.focusSubtitle}>Choose one attribute to gain 2x XP</Text>
                <View style={styles.statButtons}>
                    <TouchableOpacity 
                        style={[styles.statBtn, focusedStat === 'strength' && styles.activeStrength]}
                        onPress={() => setDailyFocus('strength')}
                    >
                        <Text style={styles.statIcon}>⚔️</Text>
                        <Text style={styles.statText}>STRENGTH</Text>
                        <Text style={styles.statDesc}>Power attacks</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.statBtn, focusedStat === 'intelligence' && styles.activeIntelligence]}
                        onPress={() => setDailyFocus('intelligence')}
                    >
                        <Text style={styles.statIcon}>🧙</Text>
                        <Text style={styles.statText}>INTELLIGENCE</Text>
                        <Text style={styles.statDesc}>Strategic thinking</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.statBtn, focusedStat === 'endurance' && styles.activeEndurance]}
                        onPress={() => setDailyFocus('endurance')}
                    >
                        <Text style={styles.statIcon}>🛡️</Text>
                        <Text style={styles.statText}>ENDURANCE</Text>
                        <Text style={styles.statDesc}>Stamina & defense</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

function StatPill({ icon, value, color }) {
    return (
        <View style={[styles.StatPill, { borderColor: color }]}>
            <Text style={style.pillIcon}>{icon}</Text>
            <Text style={[styles.pillValue, { color }]}>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#2b2416' // Warm brown from the logo background
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#d4af37', // Gold accent
        marginBottom: 20
    },
    title: { 
        fontSize: 36, 
        fontWeight: 'bold', 
        color: '#d4af37', // Gold like the logo
        letterSpacing: 4,
        textShadowColor: '#000',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    subtitle: { 
        fontSize: 14, 
        color: '#8b7355', 
        letterSpacing: 2, 
        marginTop: 5 
    },
    
    // Character Preview
    characterCard: {
        backgroundColor: '#1a1410',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 15,
        padding: 20,
        borderWidth: 2,
        borderColor: '#4a3829'
    },
    characterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    avatarCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#d4af37',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#8b4513'
    },
    avatarText: { fontSize: 32 },
    characterInfo: { 
        flex: 1, 
        marginLeft: 15 
    },
    characterName: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#fff',
        marginBottom: 5
    },
    levelBadge: {
        backgroundColor: '#d4af37',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8
    },
    levelText: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        color: '#1a1410' 
    },
    powerRow: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    powerLabel: { 
        fontSize: 14, 
        color: '#8b7355', 
        marginRight: 8 
    },
    powerValue: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#4a9eff' 
    },
    quickStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#4a3829'
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f0c08',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 2
    },
    pillIcon: { fontSize: 18, marginRight: 6 },
    pillValue: { fontSize: 16, fontWeight: 'bold' },

    // Steps Card
    stepCard: { 
        backgroundColor: '#1a1410',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 25,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#4a9eff'
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    stepLabel: { 
        fontSize: 12, 
        color: '#8b7355', 
        fontWeight: 'bold',
        letterSpacing: 1
    },
    stepRate: { 
        fontSize: 12, 
        color: '#4a9eff',
        fontWeight: 'bold'
    },
    stepCount: { 
        fontSize: 56, 
        fontWeight: 'bold', 
        color: '#fff',
        textAlign: 'center',
        marginVertical: 10
    },
    stepProgress: {
        height: 12,
        backgroundColor: '#0f0c08',
        borderRadius: 6,
        overflow: 'hidden',
        marginTop: 10
    },
    stepProgressFill: {
        height: '100%',
        backgroundColor: '#4a9eff',
        borderRadius: 6
    },
    stepGoal: {
        fontSize: 12,
        color: '#8b7355',
        textAlign: 'center',
        marginTop: 8
    },

    // Daily Focus
    focusSection: { 
        marginHorizontal: 20,
        marginBottom: 30
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: 'bold',
        color: '#d4af37',
        marginBottom: 5,
        letterSpacing: 1
    },
    focusSubtitle: {
        fontSize: 12,
        color: '#8b7355',
        marginBottom: 15
    },
    statButtons: { 
        gap: 12 
    },
    statBtn: { 
        backgroundColor: '#1a1410',
        padding: 20,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: '#4a3829',
        flexDirection: 'row',
        alignItems: 'center'
    },
    activeStrength: { 
        borderColor: '#d4af37',
        backgroundColor: '#2a2010'
    },
    activeIntelligence: { 
        borderColor: '#4a9eff',
        backgroundColor: '#0a1520'
    },
    activeEndurance: { 
        borderColor: '#8b4513',
        backgroundColor: '#1a0f0a'
    },
    statIcon: { 
        fontSize: 32, 
        marginRight: 15 
    },
    statText: { 
        fontSize: 16, 
        fontWeight: 'bold',
        color: '#fff',
        flex: 1
    },
    statDesc: {
        fontSize: 12,
        color: '#8b7355',
        fontStyle: 'italic'
    }
});