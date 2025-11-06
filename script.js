//time
date.textContent=time();

//global variables
let score, answer, level;
const levelArr=document.getElementsByName("level");
const scoreArr=[];

//event listeners
playBtn.addEventListener("click",play);
guessBtn.addEventListener("click",makeGuess);
giveUpBtn.addEventListener("click",giveUp);
function time(){
    let d= new Date();
    //concatenate the date and time
    let str =d.getMonth()+1+"/"+d.getDate()+"/"+d.getFullYear();
    let month=d.getMonth();
    function monthText(month){
        if (month+1==1){
            month="January";
        }
        else if(month+1==2){
            month="Febuary";
        }
        else if(month+1==3){
            month="March"
        }
        else if(month+1==4){
            month="April"
        }
        else if(month+1==5){
            month="May"
        }
        else if(month+1==6){
            month="June"
        }
        else if(month+1==7){
            month="July"
        }
        else if(month+1==8){
            month="August"
        }
        else if(month+1==9){
            month="September"
        }
        else if(month+1==10){
            month="October"
        }
        else if(month+1==11){
            month="November"
        }
        else if(month+1==12){
            month="December"
        }
        return month;
    }
    if ((d.getDate()-1)%10==0){
         if(d.getMonth()+1==1){
         str =monthText(d.getMonth())+" "+d.getDate()+"st "+d.getFullYear();
         }
    }
    else if((d.getDate()-2)%10==0){
         str =monthText(d.getMonth())+" "+d.getDate()+"nd "+d.getFullYear();
    }
    else if((d.getDate()-3)%10==0){
         str =monthText(d.getMonth())+" "+d.getDate()+"rd "+d.getFullYear();
    }
    else{
         str =monthText(d.getMonth())+" "+d.getDate()+"th "+d.getFullYear();
    }
    return str;

}
function play(){
    playBtn.disabled=true;
    guessBtn.disabled=false;
    guess.disabled=false;
    giveUpBtn.disabled=false;

    for(let i=0;i<levelArr.length;i++){
        levelArr[i].disabled=true;
        if(levelArr[i].checked){
            level=levelArr[i].value;
        }
    }

    answer=Math.floor(Math.random()*level)+1;
    if(!myInput.value){
    msg.textContent="Guess a number 1-"+level;
    }
    else {
        msg.textContent=myInput.value+", Guess a number 1-"+level;
    }
    guess.placeholder=answer;
    score=0;
}
function makeGuess(){
    let userGuess=Number(guess.value);
    if(isNaN(userGuess)||userGuess<1||userGuess>level){
        if (!myInput.value){
            msg.textContent="INVALID, guess a number!"}
        else{
            msg.textContent=myInput.value+"! INVALID, guess a number!";
        }
        return;
    }
    score++;
    if (userGuess>answer){
        if(!myInput.value){
            msg.textContent="Too High, guess again!"
            temperature();
        }
        else{
            msg.textContent=myInput.value+"! Too High, guess again!";
            temperature();
        }
    }
    else if(userGuess<answer){
        if (!myInput.value){
            msg.textContent="Too Low, guess again!"
            temperature();
        }
        else{
        msg.textContent=myInput.value+"! Too Low, guess again!";
        temperature();
        }
    }
    else{
        if(!myInput.value){
            msg.textContent="Correct! It took "+score+" tries. Good Job!"
        }
        else{
            msg.textContent="Correct! It took "+ score+" tries. Good Job "+myInput.value+"!";}
        reset();
        updateScore();
    }
}
function reset(){
    guessBtn.disabled=true;
    guess.value="";
    guess.placeholder="";
    guess.disabled=true;
    playBtn.disabled=false;
    giveUpBtn.disabled=true;
    for(let i=0;i<levelArr.length;i++){
        levelArr[i].disabled=false;
    }
}
function giveUp(){
    reset();
scoreArr.push(Number(level));//adds current score to array of scores
    wins.textContent="Total wins: "+scoreArr.length;
    let sum=0;
    scoreArr.sort((a, b) => a - b);//sorts ascending
    //leaderboard
    const lb=document.getElementsByName("leaderboard");

    for(let i=0;i<scoreArr.length;i++){
        sum+=scoreArr[i];
        if(i<lb.length){
            lb[i].textContent=scoreArr[i];
        }
    }
    let avg=sum/scoreArr.length;
    avgScore.textContent="Average Score: "+avg.toFixed(2);
    if(!myInput.value){
        msg.textContent="You gave up. The correct answer is "+answer;
    }
    else{
        msg.textContent=myInput.value+", you gave up. The correct answer is "+answer;
    }
    good.textContent="";
}
function updateScore(){
    scoreArr.push(score);//adds current score to array of scores
    wins.textContent="Total wins: "+scoreArr.length;
    let sum=0;
    scoreArr.sort((a, b) => a - b);//sorts ascending
    //leaderboard
    const lb=document.getElementsByName("leaderboard");

    for(let i=0;i<scoreArr.length;i++){
        sum+=scoreArr[i];
        if(i<lb.length){
            lb[i].textContent=scoreArr[i];
        }
    }
    let avg=sum/scoreArr.length;
    avgScore.textContent="Average Score: "+avg.toFixed(2);
    if (score<3){
        if (!myInput.value){
            good.textContent="Your score is good"}
        else {
            good.textContent=myInput.value+", your score is good"
        }
    }
    else if(score==3){
        if (!myInput.value){
            good.textContent="Your score is ok"}
        else {
            good.textContent=myInput.value+", your score is ok"
        }
    }
    else{
        if(!myInput.value){
        good.textContent="Your score is bad"
    }
        else {
            good.textContent=myInput.value+", your score is bad"
        }
}}
function temperature(){
    if(Math.abs(Number(guess.value)-answer)<(0.1*level)){
        temp.textContent="Your answer is hot";
    }
    else if(Math.abs(Number(guess.value)-answer)<0.3*level){
        temp.textContent="Your answer is warm";
    }
    else{
        temp.textContent="Your answer is cold"
    }
}