function dispatch_messages(messageArray) {
    messageArray.forEach((msg, index) => {
        setTimeout(() => {
            const chatBox = document.getElementById('chatBox');
            const aiDiv = document.createElement('div');
            aiDiv.className = 'message ai-message';
            aiDiv.textContent = msg;
            chatBox.appendChild(aiDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, index * 100); // Increased delay slightly for better readability
    });
}

function generate_response(x) {
    let check = 0;
    const inp = String(x).toLowerCase();

    // --- DICTIONARIES FOR WEIGHTED ALGORITHM ---

    // A: Common Symptoms
    const symptoms = ["fatigue", "pain", "headache", "cramp", "stomachache"];

    // B: Nutrient-rich foods (Top 5 per nutrient)
    const nutrientFoods = {
        "Iron": ["Spinach", "Beef Steak", "Tofu", "Lentils", "Quinoa"],
        "Vitamin B9": ["Asparagus", "Broccoli", "Avocado", "Brussels Sprouts", "Lettuce"],
        "Magnesium": ["Dark Chocolate", "Almonds", "Black Beans", "Pumpkin Seeds", "Yogurt"],
        "Vitamin D": ["Salmon", "Egg", "Milk", "Mushrooms", "Sardines"],
        "Calcium": ["Milk", "Cheese", "Tofu", "Chia Seeds", "Kale"],
        "Potassium": ["Banana", "Sweet Potato", "Spinach", "Coconut Water", "White Beans"],
        "Vitamin B12": ["Beef Steak", "Salmon", "Milk", "Egg", "Chicken Breast"]
    };

    // C: Adjective Weights
    const adjWeights = {
        "extreme": 4,
        "severe": 4,
        "very": 3,
        "some": 3,
        "moderate": 3,
        "slight": 2,
        "mild": 2,
        "bit": 2
    };

    // D: wtsym Mapping (weight + symptom -> nutrient)
    const wtsymMapping = {
        "4-fatigue": "Iron",
        "2-fatigue": "Vitamin B9",
        "3-fatigue": "Magnesium",
        "4-pain": "Vitamin D",
        "2-pain": "Calcium",
        "4-headache": "Magnesium",
        "4-cramp": "Potassium",
        "2-cramp": "Calcium",
        "4-stomachache": "Vitamin B12"
    };

    const foodData = {
        "Rice": {cal: 362, carb: true}, "Pasta": {cal: 348, carb: true}, "Potato": {cal: 87, carb: true},
        "Spaghetti": {cal: 371, carb: true}, "Noodles": {cal: 371, carb: true}, "Sweet Potato": {cal: 90, carb: true},
        "Chicken Breast": {cal: 165, carb: false}, "Chicken Thigh": {cal: 209, carb: false}, "Salmon": {cal: 208, carb: false},
        "Beef Steak": {cal: 244, carb: false}, "Pork Belly": {cal: 518, carb: false}, "Bacon": {cal: 518, carb: false},
        "Spinach": {cal: 23, carb: false}, "Broccoli": {cal: 34, carb: false}, "Carrot": {cal: 41, carb: false},
        "Egg": {cal: 155, carb: false}, "Tofu": {cal: 83, carb: false}, "Milk": {cal: 61, carb: false}
    };

    // --- ALGORITHM LOGIC ---

    let detectedSym = symptoms.find(s => inp.includes(s));
    let detectedAdj = Object.keys(adjWeights).find(a => inp.includes(a));

    if (detectedSym && detectedAdj) {
        let weight = adjWeights[detectedAdj];
        let lookupKey = `${weight}-${detectedSym}`;
        let nutrient = wtsymMapping[lookupKey] || "General Multivitamins";

        // Get 3 random foods from the top 5 for that nutrient
        let possibleFoods = nutrientFoods[nutrient] || ["Spinach", "Egg", "Salmon"];
        let shuffled = possibleFoods.sort(() => 0.5 - Math.random());
        let selectedFoods = shuffled.slice(0, 3);

        // Prepare output messages
        let res1 = `As you are suffering from "${detectedAdj}" "${detectedSym}", I suspect you are deficient in "${nutrient}".`;
        
        // Formatting suggested recipe string
        let recipeItems = selectedFoods.map(food => {
            let isCarb = foodData[food] ? foodData[food].carb : false;
            return `${food} (${isCarb ? "100g" : "50g"})`;
        }).join(", ");
        
        let res2 = `Suggested recipe ingredients: ${recipeItems}`;
        let res3 = `Generating randomized nutrient-dense meal plan...`;
        
        dispatch_messages([res1, res2, res3, "Enjoy your recovery meal!"]);
        check = 1;
    }

    // --- CALORIE RECIPE LOGIC (KEEPING EXISTING) ---
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
            
            dispatch_messages([msg1, msg2, msg3, s1, s2, s3]);
            check = 1;
        }
    }

    // --- FALLBACK LOGIC ---
    if (check === 0) {
        dispatch_messages([
            "I do understand your query!",
            "Try inputting: 'I have extreme fatigue' or 'I want a 500 kcal recipe'.",
            "I can analyze symptoms based on intensity now!"
        ]);
    }
}
