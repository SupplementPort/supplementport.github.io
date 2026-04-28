function generate_response(input){
let output = ""
let x = input; 
         if ("sybau" in x) {
            output = "yea wtf";
        } else if (x === 1) {
            output = "I don't care";
        } else if (x === 2) {
            output = "Congratulations!";
        } else {
           output = input;
        }
    alert(output);
    return output;
    
}