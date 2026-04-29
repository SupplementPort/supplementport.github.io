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

    // A: Dictionary storing common symptoms (expanded)
    const symptomsList = {
        // Energy-related
        "fatigue": "fatigue",
        "tiredness": "fatigue",
        "exhaustion": "fatigue",
        "lethargy": "fatigue",
        "weakness": "fatigue",
        "low energy": "fatigue",
        
        // Pain-related
        "pain": "pain",
        "aches": "pain",
        "soreness": "pain",
        
        // Head-related
        "headache": "headache",
        "migraine": "headache",
        
        // Muscle-related
        "cramp": "cramp",
        "cramps": "cramp",
        "muscle spasm": "cramp",
        "muscle pain": "cramp",
        
        // Stomach/digestive
        "stomachache": "stomachache",
        "stomach ache": "stomachache",
        "bellyache": "stomachache",
        "abdominal pain": "stomachache",
        "indigestion": "stomachache",
        "bloating": "stomachache",
        
        // Additional common symptoms
        "dizziness": "dizziness",
        "dizzy": "dizziness",
        "vertigo": "dizziness",
        
        "nausea": "nausea",
        "queasy": "nausea",
        
        "constipation": "constipation",
        "irregular bowel": "constipation",
        
        "diarrhea": "diarrhea",
        "loose stool": "diarrhea",
        
        "insomnia": "insomnia",
        "can't sleep": "insomnia",
        "sleep issues": "insomnia",
        
        "anxiety": "anxiety",
        "nervousness": "anxiety",
        "restlessness": "anxiety",
        
        "depression": "depression",
        "sadness": "depression",
        "low mood": "depression",
        
        "brain fog": "brainfog",
        "confusion": "brainfog",
        "poor concentration": "brainfog",
        
        "joint pain": "jointpain",
        "joint ache": "jointpain",
        "arthritis": "jointpain",
        
        "back pain": "backpain",
        "backache": "backpain",
        
        "hair loss": "hairloss",
        "thinning hair": "hairloss",
        
        "dry skin": "dryskin",
        "skin issues": "dryskin",
        
        "brittle nails": "brittlenails",
        "weak nails": "brittlenails",
        
        "cold hands": "coldintolerance",
        "cold feet": "coldintolerance",
        "always cold": "coldintolerance",
        
        "shortness of breath": "shortnessbreath",
        "breathing difficulty": "shortnessbreath",
        
        "heart palpitations": "palpitations",
        "racing heart": "palpitations",
        
        "tingling": "tingling",
        "numbness": "tingling",
        "pins and needles": "tingling",
        
        "mouth sores": "mouthsores",
        "canker sores": "mouthsores",
        "swollen tongue": "mouthsores",
        
        "poor appetite": "poorappetite",
        "loss of appetite": "poorappetite",
        
        "weight loss": "weightloss",
        "unexplained weight loss": "weightloss",
        
        "weight gain": "weightgain",
        "unexplained weight gain": "weightgain"
    };

    // B: Nutrient-rich foods (Top 5 per nutrient)
    const nutrientFoods = {
        "Iron": ["Spinach", "Beef Steak", "Tofu", "Lentils", "Quinoa"],
        "Vitamin B9": ["Asparagus", "Broccoli", "Avocado", "Brussels Sprouts", "Lettuce"],
        "Magnesium": ["Dark Chocolate", "Almonds", "Black Beans", "Pumpkin Seeds", "Yogurt"],
        "Vitamin D": ["Salmon", "Egg", "Milk", "Mushrooms", "Sardines"],
        "Calcium": ["Milk", "Cheese", "Tofu", "Chia Seeds", "Kale"],
        "Potassium": ["Banana", "Sweet Potato", "Spinach", "Coconut Water", "White Beans"],
        "Vitamin B12": ["Beef Steak", "Salmon", "Milk", "Egg", "Chicken Breast"],
        "Zinc": ["Pumpkin Seeds", "Beef Steak", "Chicken Breast", "Cashews", "Chickpeas"],
        "Vitamin C": ["Orange", "Bell Pepper", "Broccoli", "Strawberry", "Kiwi"],
        "Vitamin A": ["Carrot", "Sweet Potato", "Spinach", "Kale", "Pumpkin"],
        "Vitamin E": ["Almonds", "Sunflower Seeds", "Spinach", "Avocado", "Peanuts"],
        "Vitamin K": ["Kale", "Spinach", "Broccoli", "Brussels Sprouts", "Cabbage"],
        "Omega-3": ["Salmon", "Sardines", "Walnuts", "Flaxseeds", "Chia Seeds"],
        "Iodine": ["Seaweed", "Cod", "Yogurt", "Milk", "Egg"],
        "Selenium": ["Brazil Nuts", "Tuna", "Sardines", "Egg", "Sunflower Seeds"],
        "Copper": ["Beef Liver", "Oysters", "Shiitake Mushrooms", "Cashews", "Chickpeas"],
        "Manganese": ["Pecans", "Pineapple", "Brown Rice", "Spinach", "Sweet Potato"],
        "Chromium": ["Broccoli", "Grapes", "Potatoes", "Garlic", "Basil"],
        "Molybdenum": ["Legumes", "Lentils", "Peas", "Cauliflower", "Spinach"],
        "Phosphorus": ["Salmon", "Yogurt", "Turkey", "Chicken", "Pumpkin Seeds"]
    };

    // C: Dictionary of weighting values for adjectives (expanded)
    const adjWeights = {
        // Severe intensities
        "extreme": 4,
        "severe": 4,
        "agonizing": 4,
        "debilitating": 4,
        "unbearable": 4,
        "crippling": 4,
        "intense": 4,
        
        // Moderate-high intensities
        "very": 3,
        "quite": 3,
        "pretty": 3,
        "rather": 3,
        "significant": 3,
        "moderate": 3,
        "considerable": 3,
        
        // Moderate intensities
        "some": 2,
        "noticeable": 2,
        "occasional": 2,
        "intermittent": 2,
        "regular": 2,
        
        // Mild intensities
        "slight": 2,
        "mild": 2,
        "little": 1,
        "bit": 1,
        "minor": 1,
        "tiny": 1,
        
        // Contextual intensifiers
        "much": 3,
        "lot": 3,
        "constant": 3,
        "persistent": 3,
        "chronic": 3,
        "frequent": 2,
        "often": 2
    };

    // D: Dictionary storing "wtsym" mapping (weight-symptom -> nutrient)
    const wtsymMapping = {
        // Fatigue mappings
        "4-fatigue": "Iron",
        "3-fatigue": "Magnesium",
        "2-fatigue": "Vitamin B9",
        "1-fatigue": "Vitamin B12",
        
        // Pain mappings
        "4-pain": "Vitamin D",
        "3-pain": "Magnesium",
        "2-pain": "Calcium",
        "1-pain": "Vitamin B12",
        
        // Headache mappings
        "4-headache": "Magnesium",
        "3-headache": "Vitamin B12",
        "2-headache": "Vitamin B9",
        "1-headache": "Vitamin D",
        
        // Cramp mappings
        "4-cramp": "Potassium",
        "3-cramp": "Magnesium",
        "2-cramp": "Calcium",
        "1-cramp": "Sodium",
        
        // Stomachache mappings
        "4-stomachache": "Vitamin B12",
        "3-stomachache": "Vitamin B9",
        "2-stomachache": "Magnesium",
        "1-stomachache": "Zinc",
        
        // Dizziness mappings
        "4-dizziness": "Iron",
        "3-dizziness": "Vitamin B12",
        "2-dizziness": "Magnesium",
        "1-dizziness": "Potassium",
        
        // Nausea mappings
        "4-nausea": "Vitamin B6",
        "3-nausea": "Magnesium",
        "2-nausea": "Zinc",
        "1-nausea": "Potassium",
        
        // Constipation mappings
        "4-constipation": "Magnesium",
        "3-constipation": "Fiber",
        "2-constipation": "Potassium",
        "1-constipation": "Vitamin C",
        
        // Diarrhea mappings
        "4-diarrhea": "Zinc",
        "3-diarrhea": "Potassium",
        "2-diarrhea": "Magnesium",
        "1-diarrhea": "Vitamin B12",
        
        // Insomnia mappings
        "4-insomnia": "Magnesium",
        "3-insomnia": "Vitamin D",
        "2-insomnia": "Calcium",
        "1-insomnia": "Iron",
        
        // Anxiety mappings
        "4-anxiety": "Magnesium",
        "3-anxiety": "Vitamin B12",
        "2-anxiety": "Vitamin B9",
        "1-anxiety": "Zinc",
        
        // Depression mappings
        "4-depression": "Vitamin D",
        "3-depression": "Vitamin B12",
        "2-depression": "Magnesium",
        "1-depression": "Vitamin B9",
        
        // Brain fog mappings
        "4-brainfog": "Vitamin B12",
        "3-brainfog": "Iron",
        "2-brainfog": "Magnesium",
        "1-brainfog": "Vitamin B9",
        
        // Joint pain mappings
        "4-jointpain": "Vitamin D",
        "3-jointpain": "Calcium",
        "2-jointpain": "Magnesium",
        "1-jointpain": "Vitamin C",
        
        // Back pain mappings
        "4-backpain": "Vitamin D",
        "3-backpain": "Calcium",
        "2-backpain": "Magnesium",
        "1-backpain": "Potassium",
        
        // Hair loss mappings
        "4-hairloss": "Iron",
        "3-hairloss": "Zinc",
        "2-hairloss": "Vitamin D",
        "1-hairloss": "Vitamin B12",
        
        // Dry skin mappings
        "4-dryskin": "Vitamin E",
        "3-dryskin": "Vitamin A",
        "2-dryskin": "Zinc",
        "1-dryskin": "Omega-3",
        
        // Brittle nails mappings
        "4-brittlenails": "Iron",
        "3-brittlenails": "Calcium",
        "2-brittlenails": "Vitamin D",
        "1-brittlenails": "Zinc",
        
        // Cold intolerance mappings
        "4-coldintolerance": "Iron",
        "3-coldintolerance": "Vitamin B12",
        "2-coldintolerance": "Iodine",
        "1-coldintolerance": "Magnesium",
        
        // Shortness of breath mappings
        "4-shortnessbreath": "Iron",
        "3-shortnessbreath": "Vitamin B12",
        "2-shortnessbreath": "Magnesium",
        "1-shortnessbreath": "Potassium",
        
        // Palpitations mappings
        "4-palpitations": "Magnesium",
        "3-palpitations": "Potassium",
        "2-palpitations": "Calcium",
        "1-palpitations": "Iron",
        
        // Tingling/numbness mappings
        "4-tingling": "Vitamin B12",
        "3-tingling": "Magnesium",
        "2-tingling": "Calcium",
        "1-tingling": "Potassium",
        
        // Mouth sores mappings
        "4-mouthsores": "Vitamin B12",
        "3-mouthsores": "Iron",
        "2-mouthsores": "Zinc",
        "1-mouthsores": "Vitamin B9",
        
        // Poor appetite mappings
        "4-poorappetite": "Zinc",
        "3-poorappetite": "Vitamin B12",
        "2-poorappetite": "Iron",
        "1-poorappetite": "Magnesium",
        
        // Weight loss mappings
        "4-weightloss": "Vitamin B12",
        "3-weightloss": "Zinc",
        "2-weightloss": "Iron",
        "1-weightloss": "Magnesium",
        
        // Weight gain mappings
        "4-weightgain": "Iodine",
        "3-weightgain": "Vitamin D",
        "2-weightgain": "Magnesium",
        "1-weightgain": "Vitamin B12"
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
        "Egg": {cal: 155, carb: false}, "Tofu": {cal: 83, carb: false}, "Milk": {cal: 61, carb: false},
        "Orange": {cal: 47, carb: true}, "Bell Pepper": {cal: 31, carb: false}, "Strawberry": {cal: 32, carb: true},
        "Kiwi": {cal: 61, carb: true}, "Kale": {cal: 49, carb: false}, "Cabbage": {cal: 25, carb: false},
        "Almonds": {cal: 579, carb: false}, "Walnuts": {cal: 654, carb: false}, "Cashews": {cal: 553, carb: false},
        "Banana": {cal: 89, carb: true}, "Pumpkin Seeds": {cal: 559, carb: false}, "Chia Seeds": {cal: 486, carb: false}
    };

    // --- ALGORITHM LOGIC (Following the image flow) ---

    // Step 1: Detect symptom from input -> refers to A
    let detectedSym = null;
    let originalSymptom = null;
    for (let sym in symptomsList) {
        if (inp.includes(sym)) {
            detectedSym = symptomsList[sym];
            originalSymptom = sym;
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
        
        // If no exact match, try to find closest match
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

        // Prepare output messages
        let res1 = `As you are suffering in "${detectedAdj}" "${originalSymptom}", I suspect you are deficient in "${nutrient}"`;
        
        // Format suggested recipe with proper measurements (100g for carbs, 50g for non-carbs)
        let recipeItems = selectedFoods.map(food => {
            let isCarb = foodData[food] ? foodData[food].carb : false;
            let measurement = isCarb ? "100g" : "50g";
            return `${food} (${measurement})`;
        }).join(", ");
        
        let res2 = `Suggested recipe: ${recipeItems}`;
        
        // Random recipe generator messages (expanded)
        const randomRecipes = [
            "Try mixing these ingredients with olive oil and herbs for a nutritious meal!",
            "Blend these together for a smoothie or prepare as a warm bowl.",
            "Steam or lightly sauté these ingredients to preserve their nutrients.",
            "Create a hearty salad or soup using these key ingredients.",
            "Roast these ingredients at 400°F for 20 minutes for a delicious dish.",
            "Combine these ingredients in a stir-fry with garlic and ginger.",
            "Make a nutrient-dense smoothie bowl with these ingredients as the base.",
            "These ingredients work great in a breakfast scramble or omelette.",
            "Prepare a comforting stew with these ingredients and vegetable broth.",
            "These ingredients are perfect for a Buddha bowl with quinoa or rice."
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
            "Try inputting something like:",
            "• 'I have extreme fatigue'",
            "• 'I feel very anxious'",
            "• 'I have chronic headache'",
            "• 'I want a 500 kcal recipe'",
            "I can analyze many symptoms including fatigue, pain, headache, cramps, stomach issues, dizziness, anxiety, insomnia, and more!"
        ]);
    }
}