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

function generate_response(x, showStorePanelCallback) {
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
        "lack of energy": "fatigue",
        "feeling tired": "fatigue",
        "drained": "fatigue",
        
        // Pain-related
        "pain": "pain",
        "aches": "pain",
        "soreness": "pain",
        "aching": "pain",
        
        // Head-related
        "headache": "headache",
        "migraine": "headache",
        "head pain": "headache",
        
        // Muscle-related
        "cramp": "cramp",
        "cramps": "cramp",
        "muscle spasm": "cramp",
        "muscle pain": "cramp",
        "muscle ache": "cramp",
        
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
        "runny stool": "diarrhea",
        
        // Additional common symptoms
        "dizziness": "dizziness",
        "dizzy": "dizziness",
        "vertigo": "dizziness",
        "lightheaded": "dizziness",
        
        "nausea": "nausea",
        "queasy": "nausea",
        "sick to stomach": "nausea",
        
        "insomnia": "insomnia",
        "can't sleep": "insomnia",
        "sleep issues": "insomnia",
        "trouble sleeping": "insomnia",
        
        "anxiety": "anxiety",
        "nervousness": "anxiety",
        "restlessness": "anxiety",
        "panic": "anxiety",
        
        "depression": "depression",
        "sadness": "depression",
        "low mood": "depression",
        "feeling down": "depression",
        
        "brain fog": "brainfog",
        "confusion": "brainfog",
        "poor concentration": "brainfog",
        "foggy": "brainfog",
        
        "joint pain": "jointpain",
        "joint ache": "jointpain",
        "arthritis": "jointpain",
        
        "back pain": "backpain",
        "backache": "backpain",
        
        "hair loss": "hairloss",
        "thinning hair": "hairloss",
        "hair falling out": "hairloss",
        
        "dry skin": "dryskin",
        "skin issues": "dryskin",
        "dryness": "dryskin",
        
        "brittle nails": "brittlenails",
        "weak nails": "brittlenails",
        "breaking nails": "brittlenails",
        
        "cold hands": "coldintolerance",
        "cold feet": "coldintolerance",
        "always cold": "coldintolerance",
        "cold intolerance": "coldintolerance",
        
        "shortness of breath": "shortnessbreath",
        "breathing difficulty": "shortnessbreath",
        "hard to breathe": "shortnessbreath",
        
        "heart palpitations": "palpitations",
        "racing heart": "palpitations",
        "irregular heartbeat": "palpitations",
        
        "tingling": "tingling",
        "numbness": "tingling",
        "pins and needles": "tingling",
        
        "mouth sores": "mouthsores",
        "canker sores": "mouthsores",
        "swollen tongue": "mouthsores",
        
        "poor appetite": "poorappetite",
        "loss of appetite": "poorappetite",
        "not hungry": "poorappetite",
        
        "weight loss": "weightloss",
        "unexplained weight loss": "weightloss",
        "losing weight": "weightloss",
        
        "weight gain": "weightgain",
        "unexplained weight gain": "weightgain",
        "gaining weight": "weightgain"
    };

    // B: Nutrient-rich foods (Top 5 per nutrient)
    const nutrientFoods = {
        "Iron": ["🥩 Spinach", "🥩 Beef Steak", "🥩 Tofu", "🥩 Lentils", "🥩 Quinoa"],
        "Folate": ["🥦 Asparagus", "🥦 Broccoli", "🥑 Avocado", "🥦 Brussels Sprouts", "🥬 Lettuce"],
        "Magnesium": ["🍫 Dark Chocolate", "🌰 Almonds", "🫘 Black Beans", "🎃 Pumpkin Seeds", "🥛 Yogurt"],
        "Vitamin D": ["🐟 Salmon", "🥚 Egg", "🥛 Milk", "🍄 Mushrooms", "🐟 Sardines"],
        "Calcium": ["🥛 Milk", "🧀 Cheese", "🥩 Tofu", "🌰 Chia Seeds", "🥬 Kale"],
        "Potassium": ["🍌 Banana", "🍠 Sweet Potato", "🥬 Spinach", "🥥 Coconut Water", "🫘 White Beans"],
        "Vitamin B12": ["🥩 Beef Steak", "🐟 Salmon", "🥛 Milk", "🥚 Egg", "🍗 Chicken Breast"],
        "Zinc": ["🎃 Pumpkin Seeds", "🥩 Beef Steak", "🍗 Chicken Breast", "🌰 Cashews", "🫘 Chickpeas"],
        "Vitamin C": ["🍊 Orange", "🫑 Bell Pepper", "🥦 Broccoli", "🍓 Strawberry", "🥝 Kiwi"],
        "Vitamin A": ["🥕 Carrot", "🍠 Sweet Potato", "🥬 Spinach", "🥬 Kale", "🎃 Pumpkin"],
        "Vitamin E": ["🌰 Almonds", "🌻 Sunflower Seeds", "🥬 Spinach", "🥑 Avocado", "🥜 Peanuts"],
        "Omega-3": ["🐟 Salmon", "🐟 Sardines", "🌰 Walnuts", "🌱 Flaxseeds", "🌰 Chia Seeds"],
        "Iodine": ["🌿 Seaweed", "🐟 Cod", "🥛 Yogurt", "🥛 Milk", "🥚 Egg"],
        "Selenium": ["🌰 Brazil Nuts", "🐟 Tuna", "🐟 Sardines", "🥚 Egg", "🌻 Sunflower Seeds"],
        "Dietary Fiber": ["🌾 Oats", "🫘 Lentils", "🌰 Chia Seeds", "🥦 Broccoli", "🍎 Apple"],
        "Probiotics": ["🥛 Yogurt", "🥛 Kefir", "🥬 Kimchi", "🥬 Sauerkraut", "🍵 Kombucha"],
        "Vitamin B6": ["🍗 Chicken Breast", "🍌 Banana", "🥔 Potato", "🥬 Spinach", "🌻 Sunflower Seeds"],
        "Sodium": ["🧂 Sea Salt", "🥒 Pickles", "🫒 Olives", "🌿 Celery", "🌿 Beets"]
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
        let foods = nutrientFoods[nutrient] || ["🥬 Spinach", "🥚 Egg", "🐟 Salmon", "🥦 Broccoli", "🥛 Yogurt"];
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
        
        // Set default when no adjective found
        let finalAdjDisplay = "moderate";
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

        // Prepare output messages with emojis
        let res1 = `🩺 As you are suffering from "${grammaticalAdj}" "${originalSymptom}", I suspect you may be deficient in "${nutrient}".`;
        
        // Format suggested recipe with measurements
        let recipeItems = selectedFoods.map(food => {
            // Remove emoji for measurement check
            let cleanFood = food.replace(/[🥩🥦🥑🍫🌰🫘🎃🥛🐟🥚🍄🧀🥬🍌🍠🥥🍗🫑🍓🥝🥕🌻🥜🌿🍎🌾🍵🥒🫒🧂]/g, '').trim();
            let isCarb = foodData[cleanFood] ? foodData[cleanFood].carb : false;
            let measurement = isCarb ? "100g" : "50g";
            return `${food} (${measurement})`;
        }).join(", ");
        
        let res2 = `🍽️ Suggested recipe: ${recipeItems}`;
        
        // Random recipe generator with emojis
        const randomRecipes = [
            "👩‍🍳 Try mixing these ingredients with olive oil and herbs for a nutritious meal!",
            "🥤 Blend these together for a smoothie or prepare as a warm bowl.",
            "🔥 Steam or lightly sauté these ingredients to preserve their nutrients.",
            "🥗 Create a hearty salad or soup using these key ingredients.",
            "🔥 Roast these ingredients at 400°F for 20 minutes for a delicious dish.",
            "🍳 Combine these ingredients in a stir-fry with garlic and ginger.",
            "🥣 Make a nutrient-dense smoothie bowl with these ingredients as the base.",
            "🍳 These ingredients work great in a breakfast scramble or omelette.",
            "🍲 Prepare a comforting stew with these ingredients and vegetable broth."
        ];
        let res3 = randomRecipes[Math.floor(Math.random() * randomRecipes.length)];
        
        // Add disclaimer
        let res4 = "⚠️ Note: This is not a medical diagnosis. Please consult a healthcare professional for persistent symptoms.";
        
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
                solid: ["🔪 finely dice", "🔪 roughly chop", "🔥 sear", "🔥 slow-roast", "🔥 toast", "💨 steam", "🔪 julienne"],
                liquid: ["🥄 gently whisk", "🌿 infuse", "🔥 simmer", "🔥 warm"],
                combine: ["🔄 fold it into", "🔄 toss it with", "✨ layer it atop", "💧 drizzle it over"]
            };
            const servingStyles = ["🌿 on a bed of moss.", "🪵 on a charred cedar plank.", "🎨 with a minimalist aesthetic.", "🍳 in a rustic skillet."];

            const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
            const isLiquid = (f) => ["Milk", "Egg", "Tofu"].includes(f);

            let msg1 = `📋 Custom recipe plan (${targetCalories.toLocaleString()} kcal)`;
            let msg2 = `🛒 Ingredients list:`;
            let msg3 = ingredientResults.map(item => `• ${item.name}: ${item.grams.toFixed(1)}g`).join("\n");
            let s1 = `👩‍🍳 Step 1: ${isLiquid(selected[0]) ? getRandom(actions.liquid) : getRandom(actions.solid)} the ${selected[0].toLowerCase()}.`;
            let s2 = `👩‍🍳 Step 2: Prepare the ${selected[1].toLowerCase()} and ${getRandom(actions.combine)} it.`;
            let s3 = `🍽️ Step 3: Serve ${getRandom(servingStyles)}`;
            let s4 =  `😋 Enjoy your meal! :D`
            
            dispatch_messages([msg1, msg2, msg3, s1, s2, s3, s4]);
            check = 1;
        }
    }

    // --- SUPPLEMENT REQUEST FEATURE WITH GOOGLE MAPS IFRAME ---

    // Supplement keywords - only trigger when user is explicitly asking for supplements
    const supplementKeywords = [
        "supplement", "supplements", "where to buy", "where can i buy", 
        "get more", "increase my", "boost my", "need more", "deficient in",
        "recommend a supplement", "supplement store", "pharmacy", "health store"
    ];
    
    // Check if this is a supplement request (must have explicit keywords to avoid false positives)
    let isSupplementRequest = false;
    for (let keyword of supplementKeywords) {
        if (inp.includes(keyword)) {
            isSupplementRequest = true;
            break;
        }
    }
    
    // Also check for direct nutrient queries with "vitamin" or "mineral"
    const nutrientIndicators = ["vitamin", "mineral", "nutrient", "calcium", "magnesium", "potassium", "iron", "zinc", "folate", "fiber", "fibre", "probiotic", "iodine", "selenium"];
    for (let indicator of nutrientIndicators) {
        if (inp.includes(indicator)) {
            isSupplementRequest = true;
            break;
        }
    }

    // Comprehensive nutrient detection with full names (no chemical symbols)
    if (isSupplementRequest) {
        let detectedNutrient = null;
        
        // Check for specific nutrients in order of specificity
        const nutrientPatterns = [
    // B-Vitamins (Specific first)
    { pattern: /vitamin\s*(?:b12|b-12|cobalamin|methylcobalamin)/i, nutrient: "vitamin b12" },
    { pattern: /(?:vitamin\s*(?:b9|b-9)|folate|folic\s*acid)/i, nutrient: "vitamin b9" },
    { pattern: /vitamin\s*(?:b6|b-6|pyridoxine)/i, nutrient: "vitamin b6" },
    { pattern: /vitamin\s*(?:b3|b-3|niacin|niacinamide)/i, nutrient: "vitamin b3" },
    { pattern: /vitamin\s*(?:b2|b-2|riboflavin)/i, nutrient: "vitamin b2" },
    { pattern: /vitamin\s*(?:b1|b-1|thiamine)/i, nutrient: "vitamin b1" },
    { pattern: /vitamin\s*(?:b|b[- ]*complex)/i, nutrient: "vitamin b" },

    // Standard Vitamins
    { pattern: /vitamin\s*(?:c|ascorbic\s*acid)/i, nutrient: "vitamin c" },
    { pattern: /vitamin\s*(?:d3?|calciferol|cholecalciferol)/i, nutrient: "vitamin d" },
    { pattern: /vitamin\s*(?:e|tocopherol)/i, nutrient: "vitamin e" },
    { pattern: /vitamin\s*(?:k[12]?|phylloquinone|menaquinone)/i, nutrient: "vitamin k" },
    { pattern: /\bvitamin\s*a\b/i, nutrient: "vitamin a" },

    // Minerals & Elements
    { pattern: /\bcalcium\b/i, nutrient: "calcium" },
    { pattern: /\bmagnesium\b/i, nutrient: "magnesium" },
    { pattern: /\bpotassium\b/i, nutrient: "potassium" },
    { pattern: /\biron\b(?!\s*deficiency)/i, nutrient: "iron" },
    { pattern: /\bzinc\b/i, nutrient: "zinc" },
    { pattern: /\biodine\b/i, nutrient: "iodine" },
    { pattern: /\bselenium\b/i, nutrient: "selenium" },
    { pattern: /\bcopper\b/i, nutrient: "copper" },
    { pattern: /\bchromium\b/i, nutrient: "chromium" },

    // Specialized Nutrients
    { pattern: /\b(?:fiber|fibre|dietary\s*fiber|roughage)\b/i, nutrient: "fiber" },
    { pattern: /\b(?:probiotic|probiotics|gut\s*health|lactobacillus|bifidobacterium)\b/i, nutrient: "probiotics" },
    { pattern: /\b(?:omega[- ]*3|fish\s*oil|epa|dha)\b/i, nutrient: "omega 3" },
    { pattern: /\b(?:psyllium|ispaghula)\b/i, nutrient: "fiber" }
];
        
        // Try to match patterns
        for (let pattern of nutrientPatterns) {
            if (pattern.pattern.test(inp)) {
                detectedNutrient = pattern.nutrient;
                break;
            }
        }
        
        // Also check for standalone nutrient names
        if (!detectedNutrient) {
            const simpleNutrients = ["calcium", "magnesium", "potassium", "iron", "zinc", "folate", "fiber", "fibre", "probiotics", "iodine", "selenium", "copper", "chromium"];
            for (let nutrient of simpleNutrients) {
                if (inp.includes(nutrient)) {
                    detectedNutrient = nutrient;
                    break;
                }
            }
        }
        
        // If a nutrient was detected, output supplement info with map
        if (detectedNutrient) {
            // Normalize nutrient name for lookup
            let lookupNutrient = detectedNutrient;
            if (lookupNutrient === "fibre") lookupNutrient = "fiber";
            
            const data = supplementData[lookupNutrient];
            if (data) {
                let res1 = `✨ For ${lookupNutrient.toUpperCase()} supplementation, I recommend: ${data.supplement}`;
                let res2 = `📍 Available at: ${data.store}`;
                let res3 = `🕒 Opening hours: Mon-Sun 9:00 AM - 9:00 PM`;
                let res4 = `🗺️ The store location is shown below with a map. Click "Open in Google Maps" for directions.`;
                let res5 = `⚠️ Note: Always consult a healthcare professional before starting any supplement regimen.`;
                
                dispatch_messages([res1, res2, res3, res4, res5]);
                
                // Show the store panel with map
                if (typeof showStorePanelCallback === 'function') {
                    showStorePanelCallback(data.store, data.supplement, data.lat, data.lng, data.address);
                } else if (typeof window.showStorePanel === 'function') {
                    window.showStorePanel(data.store, data.supplement, data.lat, data.lng, data.address);
                }
                check = 1;
            } else {
                // Fallback for detected nutrient without specific data
                let res1 = `💊 For ${lookupNutrient.toUpperCase()}, consider a high-quality supplement from reputable brands.`;
                let res2 = `📍 Available at: Mannings or Watsons stores across Hong Kong`;
                let res3 = `📍 Recommended store location: Mannings (Central) - 22.28123°, 114.15678°`;
                
                dispatch_messages([res1, res2, res3]);
                
                // Show default store
                if (typeof showStorePanelCallback === 'function') {
                    showStorePanelCallback("Mannings (Central)", `${lookupNutrient.toUpperCase()} Supplement`, 22.28123, 114.15678, "Shop 101-102, Central Building, 1-3 Pedder Street, Central, Hong Kong");
                } else if (typeof window.showStorePanel === 'function') {
                    window.showStorePanel("Mannings (Central)", `${lookupNutrient.toUpperCase()} Supplement`, 22.28123, 114.15678, "Shop 101-102, Central Building, 1-3 Pedder Street, Central, Hong Kong");
                }
                check = 1;
            }
        } else if (isSupplementRequest) {
            // User asked about supplements but didn't specify which nutrient
            let res1 = "💊 Which nutrient are you looking for? I can recommend supplements and stores for:";
            let res2 = "🔹 Vitamin B12, Vitamin D, Iron, Magnesium, Zinc, Calcium";
            let res3 = "🔹 Omega-3, Probiotics, Vitamin C, Folate, Fiber, and more!";
            let res4 = "💡 Try asking: 'Where can I buy magnesium?' or 'I need a Vitamin B12 supplement'";
            
            dispatch_messages([res1, res2, res3, res4]);
            check = 1;
        }
    }
    
    // --- FALLBACK LOGIC ---
    if (check === 0) {
        dispatch_messages([
            "🤔 I don't understand your query!",
            "💡 Try inputting something like:",
            "• 🩺 'I have a headache'",
            "• 🚽 'I have constipation'", 
            "• 💩 'I have diarrhea'",
            "• 😴 'I have extreme fatigue'",
            "• 🔥 'I want a 500 kcal recipe'",
            "• 💊 'magnesium supplement' or 'where to buy calcium'",
            "✨ I can analyze many symptoms and recommend supplements!"
        ]);
    }
}

// Preset supplement data with Hong Kong stores (latitude: 22°08'N to 22°35'N, longitude: 113°49'E to 114°31'E)
const supplementData = {
    "vitamin a": {
        supplement: "💊 Retinol 10,000 IU Softgels",
        store: "🏪 Mannings (Central Store)",
        lat: 22.28123,
        lng: 114.15678,
        address: "Shop 101-102, Central Building, 1-3 Pedder Street, Central, Hong Kong"
    },
    "vitamin b": {
        supplement: "💊 Vitamin B-Complex with B12",
        store: "🏪 Watsons (Causeway Bay)",
        lat: 22.28045,
        lng: 114.18392,
        address: "Shop G01-03, Windsor House, 311 Gloucester Road, Causeway Bay, Hong Kong"
    },
    "vitamin b1": {
        supplement: "💊 Thiamine HCl 100mg Tablets",
        store: "🏪 Fanda (Tsim Sha Tsui)",
        lat: 22.29612,
        lng: 114.17234,
        address: "Shop 236-238, Ocean Terminal, Tsim Sha Tsui, Kowloon"
    },
    "vitamin b2": {
        supplement: "💊 Riboflavin 100mg Capsules",
        store: "🏪 Mannings (Mong Kok)",
        lat: 22.31789,
        lng: 114.16845,
        address: "Shop A, G/F, 578 Nathan Road, Mong Kok, Kowloon"
    },
    "vitamin b3": {
        supplement: "💊 Niacinamide 500mg Tablets",
        store: "🏪 Watsons (Jordan)",
        lat: 22.30456,
        lng: 114.17023,
        address: "Shop 1-3, G/F, 246 Nathan Road, Jordan, Kowloon"
    },
    "vitamin b5": {
        supplement: "💊 Pantothenic Acid 250mg Caps",
        store: "🏪 HK Supplement Store (Wan Chai)",
        lat: 22.27543,
        lng: 114.17289,
        address: "Shop B, G/F, 128 Johnston Road, Wan Chai, Hong Kong"
    },
    "vitamin b6": {
        supplement: "💊 Pyridoxine HCl 100mg Tablets",
        store: "🏪 Mannings (Admiralty)",
        lat: 22.27834,
        lng: 114.16567,
        address: "Shop 101, Admiralty Centre, 18 Harcourt Road, Admiralty"
    },
    "vitamin b7": {
        supplement: "💊 Biotin 10,000mcg Capsules",
        store: "🏪 Watsons (Quarry Bay)",
        lat: 22.28734,
        lng: 114.21234,
        address: "Shop 1-5, G/F, 938 King's Road, Quarry Bay"
    },
    "vitamin b9": {
        supplement: "💊 Folate 800mcg (Methylfolate)",
        store: "🏪 Fanda (North Point)",
        lat: 22.29123,
        lng: 114.20456,
        address: "Shop 201-203, City Garden, 233 Electric Road, North Point"
    },
    "vitamin b12": {
        supplement: "💊 Methylcobalamin 1000mcg Lozenges",
        store: "🏪 Mannings (Shatin)",
        lat: 22.37845,
        lng: 114.18765,
        address: "Shop 101-102, New Town Plaza, Shatin, New Territories"
    },
    "vitamin c": {
        supplement: "💊 Ester-C 1000mg with Bioflavonoids",
        store: "🏪 Watsons (Tsim Sha Tsui)",
        lat: 22.29612,
        lng: 114.17234,
        address: "Shop 301-305, Ocean Terminal, Tsim Sha Tsui"
    },
    "vitamin d": {
        supplement: "💊 Vitamin D3 2000IU Softgels",
        store: "🏪 Mannings (Causeway Bay)",
        lat: 22.28045,
        lng: 114.18392,
        address: "Shop G06, Times Square, 1 Matheson Street, Causeway Bay"
    },
    "vitamin e": {
        supplement: "💊 Mixed Tocopherols 400IU",
        store: "🏪 Fanda (Central)",
        lat: 22.28123,
        lng: 114.15678,
        address: "Shop 205, The Landmark, 15 Queen's Road Central"
    },
    "vitamin k": {
        supplement: "💊 Vitamin K2 MK-7 100mcg Drops",
        store: "🏪 Health Store (Happy Valley)",
        lat: 22.26478,
        lng: 114.18456,
        address: "Shop 3, G/F, 68 Blue Pool Road, Happy Valley"
    },
    "calcium": {
        supplement: "💊 Calcium Citrate + D3 600mg",
        store: "🏪 Watsons (Lai Chi Kok)",
        lat: 22.33456,
        lng: 114.14876,
        address: "Shop 101-102, Lai Chi Kok Plaza, 1-3 Lai Wan Road, Lai Chi Kok, Kowloon"
    },
    "magnesium": {
        supplement: "💊 Magnesium Glycinate 400mg Caps",
        store: "🏪 Fanda (Tsuen Wan)",
        lat: 22.36891,
        lng: 114.11234,
        address: "Shop 201-203, Citywalk, 1 Yeung Uk Road, Tsuen Wan, New Territories"
    },
    "potassium": {
        supplement: "💊 Potassium Citrate 99mg Tablets",
        store: "🏪 Mannings (Kwun Tong)",
        lat: 22.31234,
        lng: 114.22456,
        address: "Shop 101-102, APM Millennium City 5, Kwun Tong, Kowloon"
    },
    "iron": {
        supplement: "💊 Iron Bisglycinate 25mg Capsules",
        store: "🏪 Mannings (Wan Chai)",
        lat: 22.27543,
        lng: 114.17289,
        address: "Shop A, G/F, 188 Hennessy Road, Wan Chai, Hong Kong"
    },
    "zinc": {
        supplement: "💊 Zinc Picolinate 50mg Capsules",
        store: "🏪 Watsons (Yuen Long)",
        lat: 22.44345,
        lng: 114.02890,
        address: "Shop 1-3, G/F, 28 Castle Peak Road, Yuen Long, New Territories"
    },
    "folate": {
        supplement: "💊 Folate 800mcg (Methylfolate)",
        store: "🏪 Fanda (North Point)",
        lat: 22.29123,
        lng: 114.20456,
        address: "Shop 201-203, City Garden, 233 Electric Road, North Point, Hong Kong"
    },
    "omega 3": {
        supplement: "💊 Fish Oil 1000mg (EPA 180mg/DHA 120mg)",
        store: "🏪 Mannings (Kennedy Town)",
        lat: 22.27901,
        lng: 114.12345,
        address: "Shop G01-02, New Fortune House, 3-5 Catchick Street, Kennedy Town, Hong Kong"
    },
    "fiber": {
        supplement: "💊 Psyllium Husk Powder 500mg",
        store: "🏪 Watsons (Hung Hom)",
        lat: 22.30423,
        lng: 114.18234,
        address: "Shop 1-2, G/F, 62-66 Hung Hom Road, Hung Hom, Kowloon"
    },
    "probiotics": {
        supplement: "💊 Probiotic 50 Billion CFU (15 Strains)",
        store: "🏪 Fanda (Kowloon Bay)",
        lat: 22.32056,
        lng: 114.21056,
        address: "Shop 301-305, Telford Plaza, Kowloon Bay, Kowloon"
    },
    "iodine": {
        supplement: "💊 Potassium Iodide 225mcg Tablets",
        store: "🏪 Mannings (Tai Koo)",
        lat: 22.28734,
        lng: 114.21234,
        address: "Shop 101-102, Cityplaza, 18 Taikoo Shing Road, Tai Koo, Hong Kong"
    },
    "selenium": {
        supplement: "💊 Selenomethionine 200mcg Capsules",
        store: "🏪 Watsons (Aberdeen)",
        lat: 22.24867,
        lng: 114.15123,
        address: "Shop 1-3, G/F, 26 Aberdeen Main Road, Aberdeen, Hong Kong"
    },
    "copper": {
        supplement: "💊 Copper Glycinate 2mg Capsules",
        store: "🏪 Health Store (Sheung Wan)",
        lat: 22.28654,
        lng: 114.14892,
        address: "Shop B, G/F, 128 Wing Lok Street, Sheung Wan, Hong Kong"
    },
    "chromium": {
        supplement: "💊 Chromium Picolinate 200mcg Tablets",
        store: "🏪 Mannings (Ma On Shan)",
        lat: 22.42091,
        lng: 114.22634,
        address: "Shop 101-102, Ma On Shan Plaza, 608 Sai Sha Road, Ma On Shan, New Territories"
    }
}