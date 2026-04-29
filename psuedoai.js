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
        "constipation": "constipation",
        "irregular bowel": "constipation",
        "diarrhea": "diarrhea",
        "loose stool": "diarrhea",
        
        // Additional common symptoms
        "dizziness": "dizziness",
        "dizzy": "dizziness",
        "vertigo": "dizziness",
        
        "nausea": "nausea",
        "queasy": "nausea",
        
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
        "Folate": ["Asparagus", "Broccoli", "Avocado", "Brussels Sprouts", "Lettuce"],
        "Magnesium": ["Dark Chocolate", "Almonds", "Black Beans", "Pumpkin Seeds", "Yogurt"],
        "Vitamin D": ["Salmon", "Egg", "Milk", "Mushrooms", "Sardines"],
        "Calcium": ["Milk", "Cheese", "Tofu", "Chia Seeds", "Kale"],
        "Potassium": ["Banana", "Sweet Potato", "Spinach", "Coconut Water", "White Beans"],
        "Vitamin B12": ["Beef Steak", "Salmon", "Milk", "Egg", "Chicken Breast"],
        "Zinc": ["Pumpkin Seeds", "Beef Steak", "Chicken Breast", "Cashews", "Chickpeas"],
        "Vitamin C": ["Orange", "Bell Pepper", "Broccoli", "Strawberry", "Kiwi"],
        "Vitamin A": ["Carrot", "Sweet Potato", "Spinach", "Kale", "Pumpkin"],
        "Vitamin E": ["Almonds", "Sunflower Seeds", "Spinach", "Avocado", "Peanuts"],
        "Omega-3": ["Salmon", "Sardines", "Walnuts", "Flaxseeds", "Chia Seeds"],
        "Iodine": ["Seaweed", "Cod", "Yogurt", "Milk", "Egg"],
        "Selenium": ["Brazil Nuts", "Tuna", "Sardines", "Egg", "Sunflower Seeds"],
        "Dietary Fiber": ["Oats", "Lentils", "Chia Seeds", "Broccoli", "Apple"],
        "Probiotics": ["Yogurt", "Kefir", "Kimchi", "Sauerkraut", "Kombucha"],
        "Vitamin B6": ["Chicken Breast", "Banana", "Potato", "Spinach", "Sunflower Seeds"],
        "Sodium": ["Sea Salt", "Pickles", "Olives", "Celery", "Beets"]
    };

    // C: Dictionary of weighting values for adjectives (expanded)
    const adjWeights = {
        // Severe intensities
        "extreme": 4,
        "extremely": 4,
        "severe": 4,
        "severely": 4,
        "agonizing": 4,
        "debilitating": 4,
        "unbearable": 4,
        "crippling": 4,
        "intense": 4,
        "acute": 4,
        "chronic": 4,
        "terrible": 4,
        "horrible": 4,
        "awful": 4,
        
        // Moderate-high intensities
        "very": 3,
        "quite": 3,
        "pretty": 3,
        "rather": 3,
        "significant": 3,
        "moderate": 3,
        "considerable": 3,
        "really": 3,
        "highly": 3,
        
        // Moderate intensities
        "some": 2,
        "somewhat": 2,
        "noticeable": 2,
        "occasional": 2,
        "intermittent": 2,
        "regular": 2,
        "fairly": 2,
        
        // Mild intensities
        "slight": 1,
        "slightly": 1,
        "mild": 1,
        "mildly": 1,
        "little": 1,
        "bit": 1,
        "minor": 1,
        "tiny": 1,
        "subtle": 1
    };

    // D: Dictionary storing "wtsym" mapping (weight-symptom -> nutrient)
    const wtsymMapping = {
        // Fatigue mappings
        "4-fatigue": "Iron",
        "3-fatigue": "Magnesium",
        "2-fatigue": "Folate",
        "1-fatigue": "Vitamin B12",
        
        // Pain mappings
        "4-pain": "Vitamin D",
        "3-pain": "Magnesium",
        "2-pain": "Calcium",
        "1-pain": "Vitamin B12",
        
        // Headache mappings
        "4-headache": "Magnesium",
        "3-headache": "Vitamin B12",
        "2-headache": "Folate",
        "1-headache": "Vitamin D",
        
        // Cramp mappings
        "4-cramp": "Potassium",
        "3-cramp": "Magnesium",
        "2-cramp": "Calcium",
        "1-cramp": "Sodium",
        
        // Stomachache mappings
        "4-stomachache": "Probiotics",
        "3-stomachache": "Magnesium",
        "2-stomachache": "Zinc",
        "1-stomachache": "Folate",
        
        // Constipation mappings
        "4-constipation": "Dietary Fiber",
        "3-constipation": "Magnesium",
        "2-constipation": "Potassium",
        "1-constipation": "Probiotics",
        
        // Diarrhea mappings
        "4-diarrhea": "Probiotics",
        "3-diarrhea": "Zinc",
        "2-diarrhea": "Potassium",
        "1-diarrhea": "Magnesium",
        
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
        
        // Insomnia mappings
        "4-insomnia": "Magnesium",
        "3-insomnia": "Vitamin D",
        "2-insomnia": "Calcium",
        "1-insomnia": "Iron",
        
        // Anxiety mappings
        "4-anxiety": "Magnesium",
        "3-anxiety": "Vitamin B12",
        "2-anxiety": "Folate",
        "1-anxiety": "Zinc",
        
        // Depression mappings
        "4-depression": "Vitamin D",
        "3-depression": "Vitamin B12",
        "2-depression": "Magnesium",
        "1-depression": "Folate",
        
        // Brain fog mappings
        "4-brainfog": "Vitamin B12",
        "3-brainfog": "Iron",
        "2-brainfog": "Magnesium",
        "1-brainfog": "Folate",
        
        // Joint pain mappings
        "4-jointpain": "Vitamin D",
        "3-jointpain": "Omega-3",
        "2-jointpain": "Calcium",
        "1-jointpain": "Magnesium",
        
        // Back pain mappings
        "4-backpain": "Vitamin D",
        "3-backpain": "Magnesium",
        "2-backpain": "Calcium",
        "1-backpain": "Potassium",
        
        // Hair loss mappings
        "4-hairloss": "Iron",
        "3-hairloss": "Zinc",
        "2-hairloss": "Vitamin D",
        "1-hairloss": "Vitamin B12",
        
        // Dry skin mappings
        "4-dryskin": "Vitamin E",
        "3-dryskin": "Omega-3",
        "2-dryskin": "Vitamin A",
        "1-dryskin": "Zinc",
        
        // Brittle nails mappings
        "4-brittlenails": "Iron",
        "3-brittlenails": "Calcium",
        "2-brittlenails": "Zinc",
        "1-brittlenails": "Vitamin D",
        
        // Cold intolerance mappings
        "4-coldintolerance": "Iron",
        "3-coldintolerance": "Iodine",
        "2-coldintolerance": "Vitamin B12",
        "1-coldintolerance": "Magnesium",
        
        // Shortness of breath mappings
        "4-shortnessbreath": "Iron",
        "3-shortnessbreath": "Vitamin B12",
        "2-shortnessbreath": "Magnesium",
        "1-shortnessbreath": "Potassium",
        
        // Palpitations mappings
        "4-palpitations": "Magnesium",
        "3-palpitations": "Potassium",
        "2-palpitations": "Iron",
        "1-palpitations": "Calcium",
        
        // Tingling/numbness mappings
        "4-tingling": "Vitamin B12",
        "3-tingling": "Magnesium",
        "2-tingling": "Calcium",
        "1-tingling": "Potassium",
        
        // Mouth sores mappings
        "4-mouthsores": "Vitamin B12",
        "3-mouthsores": "Iron",
        "2-mouthsores": "Zinc",
        "1-mouthsores": "Folate",
        
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
        let foods = nutrientFoods[nutrient] || ["Spinach", "Egg", "Salmon", "Broccoli", "Yogurt"];
        // Shuffle array (Fisher-Yates)
        for (let i = foods.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [foods[i], foods[j]] = [foods[j], foods[i]];
        }
        // Return first 3 (roll 3/5 from the 5 foods)
        return foods.slice(0, 3);
    }

    // Helper function to get grammatically correct adjective form
    function getGrammaticalAdjective(adj) {
        const grammarMap = {
            "extreme": "extreme",
            "extremely": "extreme",
            "severe": "severe",
            "severely": "severe",
            "agonizing": "agonizing",
            "debilitating": "debilitating",
            "unbearable": "unbearable",
            "crippling": "crippling",
            "intense": "intense",
            "acute": "acute",
            "chronic": "chronic",
            "terrible": "terrible",
            "horrible": "horrible",
            "awful": "awful",
            "very": "very",
            "quite": "quite",
            "pretty": "pretty",
            "rather": "rather",
            "significant": "significant",
            "moderate": "moderate",
            "considerable": "considerable",
            "really": "really",
            "some": "some",
            "somewhat": "somewhat",
            "noticeable": "noticeable",
            "occasional": "occasional",
            "regular": "regular",
            "slight": "slight",
            "slightly": "slight",
            "mild": "mild",
            "mildly": "mild",
            "little": "little",
            "bit": "bit",
            "minor": "minor"
        };
        return grammarMap[adj] || adj.replace(/ly$/, '');
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
        "Banana": {cal: 89, carb: true}, "Pumpkin Seeds": {cal: 559, carb: false}, "Chia Seeds": {cal: 486, carb: false},
        "Oats": {cal: 389, carb: true}, "Apple": {cal: 52, carb: true}, "Yogurt": {cal: 59, carb: false}
    };

    // --- ALGORITHM LOGIC ---

    // Step 1: Detect symptom from input
    let detectedSym = null;
    let originalSymptom = null;
    for (let sym in symptomsList) {
        if (inp.includes(sym)) {
            detectedSym = symptomsList[sym];
            originalSymptom = sym;
            break;
        }
    }

    // If we found a symptom
    if (detectedSym) {
        // Step 2: Try to detect adjective and get weight
        let detectedAdj = null;
        let weight = null;
        for (let adj in adjWeights) {
            if (inp.includes(adj)) {
                detectedAdj = adj;
                weight = adjWeights[adj];
                break;
            }
        }
        
        // CRITICAL FIX: Set default when no adjective found
        let finalAdjDisplay = "some";
        let finalWeight = 2; // Default moderate weight
        
        if (detectedAdj !== null) {
            finalWeight = weight;
            finalAdjDisplay = detectedAdj;
        }
        
        // Get grammatically correct adjective for display
        let grammaticalAdj = getGrammaticalAdjective(finalAdjDisplay);
        
        // Compound value + "-" + sym
        let lookupKey = `${finalWeight}-${detectedSym}`;
        
        // Search D to obtain nutrient
        let nutrient = wtsymMapping[lookupKey];
        
        // If no exact match, try to find any mapping with this symptom
        if (!nutrient) {
            for (let key in wtsymMapping) {
                if (key.endsWith(detectedSym)) {
                    nutrient = wtsymMapping[key];
                    break;
                }
            }
        }
        
        // Final fallback nutrients by symptom
        if (!nutrient) {
            const defaultNutrients = {
                "fatigue": "Iron",
                "pain": "Magnesium",
                "headache": "Magnesium",
                "cramp": "Potassium",
                "stomachache": "Probiotics",
                "constipation": "Dietary Fiber",
                "diarrhea": "Probiotics",
                "dizziness": "Iron",
                "nausea": "Vitamin B6",
                "insomnia": "Magnesium",
                "anxiety": "Magnesium",
                "depression": "Vitamin D",
                "brainfog": "Vitamin B12",
                "jointpain": "Omega-3",
                "backpain": "Vitamin D",
                "hairloss": "Iron",
                "dryskin": "Vitamin E",
                "brittlenails": "Iron",
                "coldintolerance": "Iron",
                "shortnessbreath": "Iron",
                "palpitations": "Magnesium",
                "tingling": "Vitamin B12",
                "mouthsores": "Vitamin B12",
                "poorappetite": "Zinc",
                "weightloss": "Vitamin B12",
                "weightgain": "Iodine"
            };
            nutrient = defaultNutrients[detectedSym] || "General Multivitamins";
        }

        // Get 3 random foods from top 5 (roll 3/5)
        let selectedFoods = getRolledFoods(nutrient);

        // Prepare output messages
        let res1 = `As you are suffering from "${grammaticalAdj}" "${originalSymptom}", I suspect you may be deficient in "${nutrient}".`;
        
        // Format suggested recipe with measurements
        let recipeItems = selectedFoods.map(food => {
            let isCarb = foodData[food] ? foodData[food].carb : false;
            let measurement = isCarb ? "100g" : "50g";
            return `${food} (${measurement})`;
        }).join(", ");
        
        let res2 = `Suggested recipe: ${recipeItems}`;
        
        // Random recipe generator
        const randomRecipes = [
            "Try mixing these ingredients with olive oil and herbs for a nutritious meal!",
            "Blend these together for a smoothie or prepare as a warm bowl.",
            "Steam or lightly sauté these ingredients to preserve their nutrients.",
            "Create a hearty salad or soup using these key ingredients.",
            "Roast these ingredients at 400°F for 20 minutes for a delicious dish.",
            "Combine these ingredients in a stir-fry with garlic and ginger.",
            "Make a nutrient-dense smoothie bowl with these ingredients as the base.",
            "These ingredients work great in a breakfast scramble or omelette.",
            "Prepare a comforting stew with these ingredients and vegetable broth."
        ];
        let res3 = randomRecipes[Math.floor(Math.random() * randomRecipes.length)];
        
        // Add disclaimer
        let res4 = "Note: This is not a medical diagnosis. Please consult a healthcare professional for persistent symptoms.";
        
        dispatch_messages([res1, res2, res3, res4]);
        check = 1;
    }

    // --- CALORIE RECIPE LOGIC (UNTOUCHED) ---
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
            "I don't understand your query!",
            "Try inputting something like:",
            "• 'I have a headache'",
            "• 'I have constipation'", 
            "• 'I have diarrhea'",
            "• 'I have extreme fatigue'",
            "• 'I want a 500 kcal recipe'",
            "I can analyze many symptoms including fatigue, pain, headache, cramps, stomach issues, constipation, diarrhea, dizziness, anxiety, insomnia, and more!"
        ]);
    }
}