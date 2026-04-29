function dispatch_messages(messageArray) {
    messageArray.forEach((msg, index) => {
        setTimeout(() => {
            const chatBox = document.getElementById('chatBox');
            const aiDiv = document.createElement('div');
            aiDiv.className = 'message ai-message';
            aiDiv.textContent = msg;
            chatBox.appendChild(aiDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, index * 100);
    });
}

function generate_response(x) {
    let check = 0;
    const inp = String(x).toLowerCase();

    // --- DICTIONARIES FOR WEIGHTED ALGORITHM ---

    // A: Dictionary storing common symptoms
    const symptomsList = {
        "fatigue": "fatigue",
        "pain": "pain", 
        "headache": "headache",
        "cramp": "cramp",
        "stomachache": "stomachache"
    };

    // B: Database storing top 5 foods per nutrient (descending order of value)
    const nutrientFoods = {
        "Iron": ["Spinach", "Beef Steak", "Tofu", "Lentils", "Quinoa"],
        "Vitamin B9": ["Asparagus", "Broccoli", "Avocado", "Brussels Sprouts", "Lettuce"],
        "Magnesium": ["Dark Chocolate", "Almonds", "Black Beans", "Pumpkin Seeds", "Yogurt"],
        "Vitamin D": ["Salmon", "Egg", "Milk", "Mushrooms", "Sardines"],
        "Calcium": ["Milk", "Cheese", "Tofu", "Chia Seeds", "Kale"],
        "Potassium": ["Banana", "Sweet Potato", "Spinach", "Coconut Water", "White Beans"],
        "Vitamin B12": ["Beef Steak", "Salmon", "Milk", "Egg", "Chicken Breast"]
    };

    // C: Dictionary of weighting values for adjectives
    const adjWeights = {
        "extreme": 4,
        "severe": 4,
        "very": 3,
        "some": 2,      // Fixed: changed from 3 to 2 to match typical symptom intensity
        "moderate": 3,
        "slight": 2,
        "mild": 2,
        "bit": 1,       // Added lower weight for "bit"
        "little": 1,    // Added
        "much": 3       // Added
    };

    // D: Dictionary storing "wtsym" mapping (weight-symptom -> nutrient)
    const wtsymMapping = {
        "4-fatigue": "Iron",
        "3-fatigue": "Magnesium",  // Added moderate fatigue option
        "2-fatigue": "Vitamin B9",
        "1-fatigue": "Vitamin B12", // Added mild fatigue option
        
        "4-pain": "Vitamin D",
        "3-pain": "Magnesium",
        "2-pain": "Calcium",
        
        "4-headache": "Magnesium",
        "3-headache": "Vitamin B12",
        "2-headache": "Vitamin B9",
        
        "4-cramp": "Potassium",
        "3-cramp": "Magnesium",
        "2-cramp": "Calcium",
        
        "4-stomachache": "Vitamin B12",
        "3-stomachache": "Vitamin B9",
        "2-stomachache": "Magnesium"
    };

    // Helper function to get random items from array (roll 3/5)
    function getRolledFoods(nutrient) {
        let foods = nutrientFoods[nutrient] || ["Spinach", "Egg", "Salmon"];
        // Shuffle array (Fisher-Yates)
        for (let i = foods.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [foods[i], foods[j]] = [foods[j], foods[i]];
        }
        // Return first 3 (roll 3/5 from the 5 foods)
        return foods.slice(0, 3);
    }

    const foodData = {
        "Rice": {cal: 362, carb: true}, "Pasta": {cal: 348, carb: true}, "Potato": {cal: 87, carb: true},
        "Spaghetti": {cal: 371, carb: true}, "Noodles": {cal: 371, carb: true}, "Sweet Potato": {cal: 90, carb: true},
        "Chicken Breast": {cal: 165, carb: false}, "Chicken Thigh": {cal: 209, carb: false}, "Salmon": {cal: 208, carb: false},
        "Beef Steak": {cal: 244, carb: false}, "Pork Belly": {cal: 518, carb: false}, "Bacon": {cal: 518, carb: false},
        "Spinach": {cal: 23, carb: false}, "Broccoli": {cal: 34, carb: false}, "Carrot": {cal: 41, carb: false},
        "Egg": {cal: 155, carb: false}, "Tofu": {cal: 83, carb: false}, "Milk": {cal: 61, carb: false}
    };

    // --- ALGORITHM LOGIC (Following the image flow) ---

    // Step 1: Detect symptom from input -> refers to A
    let detectedSym = null;
    for (let sym in symptomsList) {
        if (inp.includes(sym)) {
            detectedSym = sym;
            break;
        }
    }

    // Step 2: Detect adjective and get weight -> refers to C
    let detectedAdj = null;
    let weight = null;
    for (let adj in adjWeights) {
        if (inp.includes(adj)) {
            detectedAdj = adj;
            weight = adjWeights[adj];
            break;
        }
    }

    // If we found both symptom and adjective
    if (detectedSym && weight !== null) {
        // Compound value + "-" + sym
        let lookupKey = `${weight}-${detectedSym}`;
        
        // Search D to obtain nutrient
        let nutrient = wtsymMapping[lookupKey];
        
        // If no exact match, try to find closest match or use default
        if (!nutrient) {
            // Try to find any matching symptom with different weight
            for (let key in wtsymMapping) {
                if (key.endsWith(detectedSym)) {
                    nutrient = wtsymMapping[key];
                    break;
                }
            }
        }
        
        nutrient = nutrient || "General Multivitamins";

        // Get 3 random foods from top 5 (roll 3/5)
        let selectedFoods = getRolledFoods(nutrient);

        // Prepare output messages exactly as shown in image
        let res1 = `As you are suffering in "${detectedAdj}" "${detectedSym}", I suspect you are deficient in "${nutrient}"`;
        
        // Format suggested recipe with proper measurements (100g for carbs, 50g for non-carbs)
        let recipeItems = selectedFoods.map(food => {
            let isCarb = foodData[food] ? foodData[food].carb : false;
            // Based on image: 100g for carbs, 50g for non-carbs
            let measurement = isCarb ? "100g" : "50g";
            return `${food} (${measurement})`;
        }).join(", ");
        
        let res2 = `Suggested recipe: ${recipeItems}`;
        
        // Random recipe generator message
        const randomRecipes = [
            "Try mixing these ingredients with olive oil and herbs for a nutritious meal!",
            "Blend these together for a smoothie or prepare as a warm bowl.",
            "Steam or lightly sauté these ingredients to preserve their nutrients.",
            "Create a hearty salad or soup using these key ingredients.",
            "Roast these ingredients at 400°F for 20 minutes for a delicious dish."
        ];
        let res3 = randomRecipes[Math.floor(Math.random() * randomRecipes.length)];
        
        dispatch_messages([res1, res2, res3]);
        check = 1;
    }

    // --- CALORIE RECIPE LOGIC (KEEPING EXISTING UNTOUCHED) ---
    if (check === 0) {
        const calMatch = inp.match(/(\d+(?:\.\d+)?)\s*(calories?|kcals?|cals?)/);
        if (calMatch) {
            let rawVal = parseFloat(calMatch[1]);
            const unit = calMatch[2];
            let targetCalories = (unit === "cal" || unit === "cals") ? rawVal / 1000 : rawVal;

            const foodKeys = Object.keys(foodData);
            let weightedPool = [];
            foodKeys.forEach(key => {
                let weight = foodData[key].carb ? 3 : 1;
                for(let i = 0; i < weight; i++) weightedPool.push(key);
            });

            let selected = [];
            while (selected.length < 3) {
                let randomFood = weightedPool[Math.floor(Math.random() * weightedPool.length)];
                if (!selected.includes(randomFood)) selected.push(randomFood);
            }

            let calorieWeights = selected.map(ing => foodData[ing].carb ? 2.0 : 0.5);
            let totalCalWeight = calorieWeights.reduce((a, b) => a + b, 0);
            let normalizedCalRatios = calorieWeights.map(w => w / totalCalWeight);

            let ingredientResults = selected.map((ing, i) => {
                let calContribution = targetCalories * normalizedCalRatios[i];
                let grams = (calContribution / foodData[ing].cal) * 100;
                return { name: ing, grams: grams, cals: calContribution };
            });

            let totalWeight = ingredientResults.reduce((sum, item) => sum + item.grams, 0);
            if (totalWeight > 600 && targetCalories < 2500) {
                let scaleFactor = 600 / totalWeight;
                ingredientResults.forEach(item => { item.grams *= scaleFactor; });
            }

            const actions = {
                solid: ["finely dice", "roughly chop", "sear", "slow-roast", "toast", "steam", "julienne"],
                liquid: ["gently whisk", "infuse", "simmer", "warm"],
                combine: ["fold it into", "toss it with", "layer it atop", "drizzle it over"]
            };
            const servingStyles = ["on a bed of moss.", "on a charred cedar plank.", "with a minimalist aesthetic.", "in a rustic skillet."];

            const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
            const isLiquid = (f) => ["Milk", "Egg", "Tofu"].includes(f);

            let msg1 = `Custom recipe plan (${targetCalories.toLocaleString()} kcal)`;
            let msg2 = `Ingredients list:`;
            let msg3 = ingredientResults.map(item => `• ${item.name}: ${item.grams.toFixed(1)}g`).join("\n");
            let s1 = `Step 1: ${isLiquid(selected[0]) ? getRandom(actions.liquid) : getRandom(actions.solid)} the ${selected[0].toLowerCase()}.`;
            let s2 = `Step 2: Prepare the ${selected[1].toLowerCase()} and ${getRandom(actions.combine)} it.`;
            let s3 = `Step 3: Serve ${getRandom(servingStyles)}`;
            let s4 =  `Enjoy your meal! :D`
            
            dispatch_messages([msg1, msg2, msg3, s1, s2, s3, s4]);
            check = 1;
        }
    }

    // --- FALLBACK LOGIC ---
    if (check === 0) {
        dispatch_messages([
            "I understand your query!",
            "Try inputting: 'I have extreme fatigue' or 'I want a 500 kcal recipe'.",
            "I can analyze symptoms based on intensity now!"
        ]);
    }
}