
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
    let check = 0
    const inp = String(x).toLowerCase();
    
    const foodData = {
        "Rice": {cal: 362, carb: true}, "Pasta": {cal: 348, carb: true}, "Potato": {cal: 87, carb: true},
        "Spaghetti": {cal: 371, carb: true}, "Noodles": {cal: 371, carb: true}, "Sweet Potato": {cal: 90, carb: true},
        "Chicken Breast": {cal: 165, carb: false}, "Chicken Thigh": {cal: 209, carb: false}, "Salmon": {cal: 208, carb: false},
        "Beef Steak": {cal: 244, carb: false}, "Pork Belly": {cal: 518, carb: false}, "Bacon": {cal: 518, carb: false},
        "Spinach": {cal: 23, carb: false}, "Broccoli": {cal: 34, carb: false}, "Carrot": {cal: 41, carb: false},
        "Egg": {cal: 155, carb: false}, "Tofu": {cal: 83, carb: false}, "Milk": {cal: 61, carb: false}
    };

    const calMatch = inp.match(/(\d+(?:\.\d+)?)\s*(calories?|kcals?|cals?)/);
    
    if (calMatch) {
        let rawVal = parseFloat(calMatch[1]);
        const unit = calMatch[2];
        let targetCalories = (unit === "cal" || unit === "cals") ? rawVal / 1000 : rawVal;

        // Selection pool with 3x weighting for carbs
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

        // Bias the calorie distribution toward the carb-heavy ingredient
        let calorieWeights = selected.map(ing => foodData[ing].carb ? 2.0 : 0.5);
        let totalCalWeight = calorieWeights.reduce((a, b) => a + b, 0);
        let normalizedCalRatios = calorieWeights.map(w => w / totalCalWeight);

        let ingredientResults = selected.map((ing, i) => {
            let calContribution = targetCalories * normalizedCalRatios[i];
            let grams = (calContribution / foodData[ing].cal) * 100;
            return { name: ing, grams: grams, cals: calContribution };
        });

        // 600g Ceiling Logic
        let totalWeight = ingredientResults.reduce((sum, item) => sum + item.grams, 0);
        if (totalWeight > 600 && targetCalories < 2500) {
            let scaleFactor = 600 / totalWeight;
            ingredientResults.forEach(item => {
                item.grams *= scaleFactor;
            });
        }

        const actions = {
            solid: ["finely dice", "roughly chop", "sear", "slow-roast", "toast", "steam", "julienne"],
            liquid: ["gently whisk", "infuse", "simmer", "warm"],
            combine: ["fold it into", "toss it with", "layer it atop", "drizzle it over"]
        };
        const servingStyles = ["on a bed of moss.", "on a charred cedar plank.", "with a minimalist aesthetic.", "in a rustic skillet."];

        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const isLiquid = (f) => ["Milk", "Egg", "Tofu"].includes(f);

        // Prepare messages
        let msg1 = `Custom recipe plan (${targetCalories.toLocaleString()} kcal)`;
        let msg2 = `Ingredients list:`;
        let msg3 = ingredientResults.map(item => `• ${item.name}: ${item.grams.toFixed(1)}g`).join("\n");
        let msg4 = `Preparation steps:`;
        let s1 = `Step 1: ${isLiquid(selected[0]) ? getRandom(actions.liquid) : getRandom(actions.solid)} the ${selected[0].toLowerCase()} for the base.`;
        let s2 = `Step 2: Prepare the ${selected[1].toLowerCase()} and ${getRandom(actions.combine)} your mixture.`;
        let s3 = `Step 3: Finally, ${getRandom(actions.combine)} the ${selected[2].toLowerCase()} and serve ${getRandom(servingStyles)}`;
        let s4 = `Enjoy your meal!`;
        dispatch_messages([msg1, msg2, msg3, msg4, s1, s2, s3, s4]);
        check = 1
    }
    const symptomMap = {
        "headache": ["Magnesium", "Riboflavin (B2)", "Water", "Coenzyme Q10"],
        "migraine": ["Magnesium", "Riboflavin (B2)", "Water", "Coenzyme Q10"],
        "stomach": ["Dietary Fiber", "Probiotics", "Zinc", "Vitamin B12"],
        "belly": ["Dietary Fiber", "Probiotics", "Zinc", "Vitamin B12"],
        "digestion": ["Dietary Fiber", "Probiotics", "Zinc", "Vitamin B12"],
        "hip": ["Vitamin D", "Calcium", "Vitamin K2", "Magnesium"],
        "bone": ["Vitamin D", "Calcium", "Vitamin K2", "Magnesium"],
        "cramp": ["Potassium", "Magnesium", "Calcium", "Sodium (Electrolytes)"],
        "muscle": ["Potassium", "Magnesium", "Calcium", "Sodium (Electrolytes)"],
        "fatigue": ["Iron", "Vitamin B12", "Folate", "Magnesium", "Vitamin D"],
        "tired": ["Iron", "Vitamin B12", "Folate", "Magnesium", "Vitamin D"],
        "exhausted": ["Iron", "Vitamin B12", "Folate", "Magnesium", "Vitamin D"],
        "skin": ["Omega-3 Fatty Acids", "Vitamin A", "Vitamin E", "Zinc"],
        "hair": ["Biotin (B7)", "Iron", "Zinc", "Protein"],
        "nails": ["Biotin (B7)", "Iron", "Zinc", "Protein"],
        "gum": ["Vitamin C", "Vitamin K"],
        "vision": ["Vitamin A"],
        "eyes": ["Vitamin A"],
        "mouth": ["Vitamin B12", "Iron", "Folate", "Riboflavin"],
        "ulcer": ["Vitamin B12", "Iron", "Folate", "Riboflavin"],
        "joint": ["Omega-3 Fatty Acids", "Vitamin C", "Vitamin D"],
        "stiff": ["Omega-3 Fatty Acids", "Vitamin C", "Vitamin D"],
        "tingling": ["Vitamin B12", "Vitamin B6", "Folate"],
        "numb": ["Vitamin B12", "Vitamin B6", "Folate"],
        "healing": ["Vitamin C", "Zinc", "Protein"],
        "fog": ["Omega-3 Fatty Acids", "Iron", "Iodine", "Vitamin B12"],
        "concentrate": ["Omega-3 Fatty Acids", "Iron", "Iodine", "Vitamin B12"]
    };

    let foundNutrients = new Set();
    Object.keys(symptomMap).forEach(symptom => {
        if (inp.includes(symptom)) {
            symptomMap[symptom].forEach(n => foundNutrients.add(n));
        }
    });

    if (foundNutrients.size > 0) {
        let nutrientMsgs = ["I've analyzed your symptoms. You might be lacking:"];
        foundNutrients.forEach(nutr => nutrientMsgs.push(`• ${nutr}`));
        nutrientMsgs.push("Keep in mind, I'm an AI, not a doctor. Please consult a professional!");
        dispatch_messages(nutrientMsgs);
        check = 1;
    }
if (check===0){
    dispatch_messages(["I do understand your query!","Try inputting the following:","How do I get more vitamin B?","Where can I find (supplement name)?","I'm feeling a bit unwell.","Please generate a 500 kcal healthy meal recipe."])
}
    

}