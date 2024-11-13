let webcam;
let detector;

let videoFrame;

let state = 0;
// 0: main page  1: recording page  2: paused page  3: saved page

let btn_pause = [];
let btn_record = [];
let btn_stop = [];
let icon_person;
let stateIndicator = [];

let recordingTime = '00:00:00'; //Text type variable
let recordingStartTime = 0; //Number type varialbe
let pausedStartTime = 0; //Number type variable
let pausedTime = 0; //Number type variable
let totalPausedTime = 0; //Number type variable

let peopleNumber = 0;

let detectedObjects = [];

let myWriter;
let writerMsg='';

function preload() {  
  detector = ml5.objectDetector('cocossd');
  
  videoFrame = loadImage('img/video_preview.png');
  
  btn_pause[0] = loadImage('img/Stop_btn.png');
  btn_pause[1] = loadImage('img/Stopped.png');
  
  btn_record[0] = loadImage('img/Record_btn.png');
  btn_record[1] = loadImage('img/Recording.png');
  btn_record[2] = loadImage('img/Record_btn.png');
  btn_record[3] = loadImage('img/Record_btn.png');
  
  btn_stop[0] = loadImage('img/Save_btn.png');
  btn_stop[1] = loadImage('img/Save_btn.png');
  
  
  stateIndicator[0] = loadImage('img/tapToRecord.png');
  stateIndicator[1] = loadImage('img/State_recording.png');
  stateIndicator[2] = loadImage('img/State_paused.png');
  stateIndicator[3] = loadImage('img/State_saved.png');
}

function setup() {
  createCanvas(960, 540);
  webcam = createCapture(VIDEO);
  webcam.size(720, 540);
  webcam.hide();
  
  detector.detect(webcam, gotDetections);
}

function draw() {
  background(255);
  
  calculateRecordingTime();
  
  drawVideoPreview(0,0,720,540);
  
  doCOCOSSD();
  
  drawButtons(state);
  drawStatusBar(state);
  drawCounter(state);
  drawStateIndicator(state);
  writeLog(state);
  
  peopleNumber = 0;
}

function drawVideoPreview(x, y, w, h){
  image(webcam, x, y, w, h);
  image(videoFrame, x, y, w, h);
}

function drawStateIndicator(currentState){
  image(stateIndicator[currentState], 781,426,120,24);
}

function drawButtons(currentState){
  let pause_stop_button_number = 0;
  if(currentState == 1){
    pause_stop_button_number = 1;
  }  
  image(btn_pause[pause_stop_button_number], 742, 470, 42, 42);
  image(btn_record[currentState], 816, 470, 42, 42);
  image(btn_stop[pause_stop_button_number], 890, 470, 42, 42);
}

function drawCounter(currentState){
  
  
  textFont('Inter');
  textSize(18);
  
  if(currentState == 1){
    fill(0);
    textAlign(LEFT);
    text('people: ' +peopleNumber, 742, 50);

  }else{
    fill(0,153);
    textAlign(LEFT);
    text('people: ' +peopleNumber, 742, 50);
    tint(255,153);
    tint(255);
  }
}

function drawStatusBar(currentState){
  fill(0, 60);
  noStroke();
  rect(2,2,104,20,4);
  rect(118,2,82,20,4);
  rect(212,2,106,20,4);
  
  textFont('Inter');
  textSize(14);
  
  let currentTime = ''+nf(hour(),2,0)+':'+nf(minute(),2,0)+':'+nf(second(),2,0);
  let currentDate = ''+year()+'.'+nf(month(),2,0)+'.'+nf(day(),2,0)+'.';
  
  if(currentState == 0){
    noFill();
    stroke(255,153);
    strokeWeight(2);
    ellipse(16,12,11,11);
    fill(255,153);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 29, 17);
    textAlign(CENTER);
    text(currentTime, 150, 17);
    textAlign(LEFT);
    text(currentDate, 222, 17);
  }else if(currentState == 1){
    fill(202,38,38);
    noStroke();
    ellipse(16,12,12,12);
    fill(202,38,38);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 29, 17);
    fill(255);
    textAlign(CENTER);
    text(currentTime, 150, 17);
    textAlign(LEFT);
    text(currentDate, 222, 17);
  }else if(currentState == 2){
    noFill();
    stroke(202,38,38);
    strokeWeight(2);
    ellipse(16,12,11,11);
    fill(202,38,38);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 29, 17);
    fill(255,153);
    textAlign(CENTER);
    text(currentTime, 150, 17);
    textAlign(LEFT);
    text(currentDate, 222, 17);
  }else if(currentState == 3){
    noFill();
    stroke(255,153);
    strokeWeight(2);
    ellipse(16,12,11,11);
    fill(255,153);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 29, 17);
    textAlign(CENTER);
    text(currentTime, 150, 17);
    textAlign(LEFT);
    text(currentDate, 222, 17);
  }
}

function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  
  detectedObjects = results;
  detector.detect(webcam, gotDetections);
}
//==========================BUTTON ACTION ADDED===============================
function mouseReleased(){
  if(state == 0){
    if(mouseX > 816 && mouseX < 858 && mouseY > 470 && mouseY < 512){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 0.Main Page.
      recordingStartTime = millis();
      startLog();
    }
  }else if(state == 1){
    if(mouseX > 742 && mouseX < 784 && mouseY > 470 && mouseY < 512){ // for Pause BTN
      state = 2; //go to 2.Paused Page from 1.Recording Page.
      pausedStartTime = millis();
    }
    if(mouseX > 890 && mouseX < 932 && mouseY > 470 && mouseY < 512){ // for Stop BTN
      state = 3; //go to 3.Saved Page from 1.Recording Page.
      initializeTimes();
      saveLog();
    }
  }else if(state == 2){
    if(mouseX > 816 && mouseX < 858 && mouseY > 470 && mouseY < 512){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 2.Paused Page.
      totalPausedTime = totalPausedTime + pausedTime;
    }
  }else if(state == 3){
    if(mouseX > 816 && mouseX < 858 && mouseY > 470 && mouseY < 512){ // for Recording BTN
      state = 0; //go to 0.Main Page from 3.Saved Page.
    }
  }
}
function initializeTimes(){
  recordingStartTime = 0;
  pausedStartTime = 0;
  pausedTime = 0;
  totalPausedTime = 0;
}
function calculateRecordingTime(){
  let cur_time = millis();
  
  if(state == 0){ //0.Main Page
    recordingTime = '00:00:00';
  }else if(state == 1){ //1.Recording Page
    let rec_time = cur_time - recordingStartTime - totalPausedTime;
    let rec_sec = int(rec_time / 1000) % 60;
    let rec_min = int(rec_time / (1000*60)) % 60;
    let rec_hour = int(rec_time / (1000*60*60)) % 60;
    
    recordingTime = ''+nf(rec_hour,2,0)+':'+nf(rec_min,2,0)+':'+nf(rec_sec,2,0);
  }else if(state == 2){ //2.Paused Page
    pausedTime = millis() - pausedStartTime;
  }else if(state == 3){ //3.Saved Page
    recordingTime = '00:00:00';
  }
}
//==========================COCOSSD ADDED===============================
function doCOCOSSD(){
  let tempMsg='';
  for (let i = 0; i < detectedObjects.length; i++) {
    let object = detectedObjects[i];
    
    if(object.label == 'person'){
      peopleNumber = peopleNumber + 1;
      
      stroke(255,0,254);
      strokeWeight(2);
      noFill();
      rect(object.x, object.y, object.width, object.height);
      noStroke();
      fill(255,0,254);
      textSize(10);
      text(object.label+' '+peopleNumber, object.x, object.y - 5);
      
      let centerX = object.x + (object.width/2);
      let centerY = object.y + (object.height/2);
      strokeWeight(4);
      stroke(255,0,254);
      point(centerX, centerY);
      
      tempMsg = tempMsg+','+peopleNumber+','+centerX+','+centerY;
      //개별 사람만들의 X, Y 좌표값 저장
    }
  }
  let millisTime = int(millis() - recordingStartTime - totalPausedTime);
  writerMsg = ''+recordingTime+','+millisTime+','+peopleNumber+''+tempMsg;
  // 현재 레코딩 타임과 함께 tempMsg 저장
}
//==========================WRITER ADDED===============================
function startLog(){
  let mm = nf(month(),2,0);
  let dd = nf(day(),2,0);
  let ho = nf(hour(),2,0);
  let mi = nf(minute(),2,0);
  let se = nf(second(),2,0);
  
  let fileName = 'data_'+ mm + dd +'_'+ ho + mi + se+'.csv';
  
  myWriter = createWriter(fileName);
}
function saveLog(){
  myWriter.close();
  myWriter.clear();
}
function writeLog(currentState){
  if(currentState == 1){
    myWriter.print(writerMsg);
  }
}
