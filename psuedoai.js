// Helper to send individual bubbles with a slight delay
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

        // Selection pool with 10x weighting for carbs
        const foodKeys = Object.keys(foodData);
        let weightedPool = [];
        foodKeys.forEach(key => {
            let weight = foodData[key].carb ? 10 : 1;
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
        
        // If it's a normal calorie request but exceeds 600g, we force-scale densities
        if (totalWeight > 600 && targetCalories < 2500) {
            let scaleFactor = 600 / totalWeight;
            ingredientResults.forEach(item => {
                item.grams *= scaleFactor;
                // Note: calories will technically be lower here to fit the weight cap
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
        return null;
    }

    return "Please specify a calorie target.";
}