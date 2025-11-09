import AppleHealthKit from 'react-native-health';

const [stepsToday, setStepsToday] = useState(0);
const [stepRate, setStepRate] = useState(0);
const [focusedStat, setFocusedStat] = useState(null);

const permissions = {
    permissions: {
        read: [AppleHealthKit.Constants.Permissions.Steps],
    },
};

AppleHealthKit.initHealthKit(permissions, (error) => {
    if (error) {
      console.error("Error getting HealthKit permissions:", error);
      return;
    }
    // Permissions granted!
  });

async function calculateStepRate (date) { 
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999)

    const qOptions = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    };

    try {

        const hourlySteps = await new Promise((resolve, reject) => {AppleHealthKit.getStepCount})
    }
    // const now = new Date();
    // const hoursSinceMidnight = now.getHours() + now.getMinutes() / 60;
    // setStepRate(Math.round(steps / (hoursSinceMidnight || 1)));

    // TODO: make this function return the steps per hour of the hour with the greatest number of steps in the day
};

const fetchSteps = () => {
    const options = {
        date: new Date().toISOString(),
        includeManuallyAdded: false
    };

    AppleHealthKit.getStepCount(options, (err, results) => {
        if (!err) {
            setStepsToday(results.value);
            calculateStepRate(results.value);
            // syncStepsToServer(results.value);
        }
    });
};