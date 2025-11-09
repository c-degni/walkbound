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

// The calculateStepRate function takes in a date for its parameter and returns a value "maxStepsInOneHour". 
async function calculateStepRate (date) { 
    //The next four lines are simply setting the boundaries for a day (midnight to 11:59)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999)

    //"Hey HealthKit, please look at all the step data between 12:00 AM and 11:59 PM on this specific day. Then, give me back a list where each item in the list is the total steps for each hour in that window."
    const qOptions = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    };

    try {
        const hourlySteps = await new Promise((resolve, reject) => {
            AppleHealthKit.getDailyStepCountSamples(qOptions, (err, results) => {
                if (err) {
                    return reject(new Error(`HealthKit query failed: ${err.message}`));
                }
                return resolve(results);
            });
        });
        if (!hourlySteps || hourlySteps.length === 0) {
            console.log(`No step data found for ${startDate.toDateString()}`);
            return 0; // Return 0 if no steps were recorded
        }
        const allStepValues = hourlySteps.map(hour => hour.value);
        const maxStepsInOneHour = Math.max(...allStepValues);

        return maxStepsInOneHour;

    } catch (error) {
        console.error("Error in getHighestHourlyStepsForDay:", error);
        return 0; // Return 0 on error
    }
}

const fetchSteps = () => {
    const options = {
      date: new Date().toISOString(), // Correctly gets today's steps
      includeManuallyAdded: false
    };
  
    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        console.error("Error fetching total steps: ", err);
        return;
      }
  
      if (results) {
        const totalStepsToday = results.value;
        
        setStepsToday(totalStepsToday);
        
        syncStepsToServer(totalStepsToday);
      }
    });
  };    
