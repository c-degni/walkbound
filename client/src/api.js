
import { createClient } from "@supabase/supabase-js";

let authToken = null;
let bossUserId = '';

const supabase = createClient(process.env.API_URL, process.env.API_KEY)

export const login = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (data.token) {
            authToken = data.token;
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login error: ', error);
        return false;
    }
};

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    })
    if (error) throw error;
    setMessage("Login successful!");
    console.log("Session:", data.session);
}

/**
 * 
 * @param {string} email The email associated with the account 
 * @param {string} password The password used to login
 * @param {string} name The username associated with the account
 */
export const register = async (email, password, name) => {
    if (name == null) {
        
    }
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        console.error('Error signing up:', error);
        return null;
    }

    const user = data.user
    if (!user) {
        console.error('No user returned from signUp');
        return null;
    }

    if (!name) {
        console.error('No username provided');
        return null;
    }

    // Inserting a new user into the users table
    const { error: insertError } = await supabase.from('users').insert([
        {
            user_id: user.id, // from Supabase Auth
            email: user.email,
            name,
            created_at: new Date().toISOString(),
            steps: 0,
        },
    ])

    
    if (insertError) {
        console.error('Error inserting into users table:', insertError)
        return null
    }

    console.log('User registered successfully:', user.email)
    return user
};

/**
 * Gets the steps on a certain day from the ser
 * @param {Date} date 
 */
export const getStepsFromServer = async (date) => {
    const response = await supabase
        .from("users")
        .select()
};

/**
 * Updates a day's daily steps on the server.
 * @param {number} stepsAtStart - The number of steps at the start of the day.
 * @param {date} date - The date to be updated.
 */
export const updateDailySteps = async (stepsAtStart, date) => {
    // Getting the current user from the session:
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        console.error('No authenticated user:', userError)
        return null
    }

    const { data : userData, error : fetchError } = await supabase
        .from('daily')
        .update({ steps : newSteps })
        .eq('user_id', user.id)
        .eq('date', date.toISOString())
        .select()
    
    if (updateError) {
        console.log('Error updating steps: ', updateError)
        return null
    }

    return data
};

export const syncStepsToServer = async (newSteps) => {
    const response = await supabase
        .from("users")
        .update( {steps: newSteps } )
        .eq('user_id', userId)
        .select();
};

// export const updateDailyFocus = async (focus) => {
//     const response = await supabase
//         .from('daily')

// }

export const fetchCharacterData = async () => {
    const response = await supabase
        .from("users")
        .eq('user_id', userId)
        .single();
};

export const addFriends = async (friendId) => {
    try {
      // 1. Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to send a friend request.");
      }
  
      const currentUserId = user.id;
  
      // 2. Prevent user from adding themselves
      if (currentUserId === friendId) {
        Alert.alert("Error", "You cannot add yourself as a friend.");
        return;
      }
  
      // 3. Create the friend request row
      // We set the status to 'pending'
      const { data, error } = await supabase
        .from('friends') // Your friends table
        .insert({
          user_id: currentUserId, // The person sending the request
          friend_id: friendId,      // The person receiving the request
          status: 'pending'
        });
  
      if (error) {
        // 4. Handle potential errors (like a duplicate request)
        if (error.code === '23505') { // 23505 is the code for 'unique_violation'
          Alert.alert("Already Sent", "You have already sent a friend request to this user.");
        } else {
          throw error;
        }
      } else {
        Alert.alert("Success", "Friend request sent!");
      }
  
    } catch (error) {
      console.error("Error sending friend request:", error.message);
      Alert.alert("Error", error.message);
    }
  };

export const acceptFriendRequest = async (senderId) => {
  try {
    // 1. Get the current user (the one accepting the request)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("You must be logged in to accept a request.");
    }

    const currentUserId = user.id;

    // 2. Perform the update
    // We find the row where:
    // - The 'user_id' is the person who sent it (senderId)
    // - The 'friend_id' is me (currentUserId)
    // - The 'status' is 'pending'
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('user_id', senderId)       // Match the sender
      .eq('friend_id', currentUserId) // Match me (the receiver)
      .eq('status', 'pending')        // Only update if it's still pending
      .select();                      // Return the updated row

    if (error) {
      throw error;
    }

    // 3. Check if the update was successful
    if (data && data.length > 0) {
      Alert.alert("Friend Added!", "You are now friends.");
    } else {
      // This happens if no row matched (e.g., request was already accepted/deleted)
      Alert.alert("Error", "Could not find a pending request from this user.");
    }

  } catch (error) {
    console.error("Error accepting friend request:", error.message);
    Alert.alert("Error", error.message);
  }
};

export const fetchFriends = async () => {
    try {
        const response = await fetch(`${API_URL}/friends`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Fetch character data error: ', error);
        return [];
    }
};

export const fetchCurrentBoss = async () => {
    try {
        const response = await fetch(`${API_URL}/boss/current`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Fetch boss error: ', error);
        return null;
    }
};

export const attackBoss = async () => {
    try {
        const response = await fetch(`${API_URL}/steps/update`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' ,
                'Authorization': `Bearer ${authToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Attack boss error: ', error);
        return { hit: false };
    }
};