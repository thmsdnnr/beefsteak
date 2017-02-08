window.onload=function() {
  //Global DOM selectors
  let clock=document.querySelector('canvas#clock');
  let controls=document.querySelector('div#controls');
  let app=document.querySelector('div#app');
  let pomoCount=document.querySelector('span#pomoCount');
  let pomoTime = document.querySelector('span#pomoTime');
  let breakTime = document.querySelector('span#breakTime');

  //event listeners for control hiding
  let controlsVisible=false;
  app.addEventListener('mouseover',showControls);
  app.addEventListener('mouseleave',hideControls);
  controls.addEventListener('mouseover',()=>controlsVisible=true);
  controls.addEventListener('click', handleControls);

  //defaults in seconds. 5 minute breaks, 25 minute pomodoros.
  let breakDuration=5*60;
  let pomoDuration=25*60;

  function handleControls(e) {
    switch(e.target.id) {
      case 'pause': thisTimer.Pause(); break;
      case 'reset': thisTimer.Reset(); break;
      case 'pomoUp':
        if (thisTimer.type==='POMO') { pomoDuration=thisTimer.Add(1); }
        else { pomoDuration+=60; }
        pomoTime.innerHTML=Math.floor(pomoDuration/60);
        break;
      case 'pomoDown':
        if (thisTimer.type==='POMO') { pomoDuration=thisTimer.Subtract(1); }
        else { (pomoDuration>60) ? pomoDuration-=60 : null; }
        pomoTime.innerHTML=Math.floor(pomoDuration/60);
        break;
      case 'breakUp':
        if (thisTimer.type==='BREAK') { breakDuration=thisTimer.Add(1); }
        else { breakDuration+=60; }
        breakTime.innerHTML=Math.floor(breakDuration/60);
        break;
      case 'breakDown':
        if (thisTimer.type==='BREAK') { breakDuration=thisTimer.Subtract(1); }
        else { (breakDuration>60) ? breakDuration-=60 : null; }
        breakTime.innerHTML=Math.floor(breakDuration/60);
        break;
      default: break;
    }
  }

  function showControls() {
    controls.classList.add('visible');
    app.classList.add('pushDown');
  }

  function hideControls() {
    console.log('hideControls');
    controlsVisible=false;
    console.log(controlsVisible);
    setTimeout(function(){
    if (!controlsVisible) {
    controls.classList.remove('visible');
    app.classList.remove('pushDown');
    }
  },1000);
}

  let colors = { //colors for our HTML5 canvas timer rendering
    textColor: '#212121',
    circleFill: '#C5CAE9',
    progressBar: '#FF0000',
    progressBarBackground: '#212121'
  };

  let canvas=document.getElementById('clock');
  let context=canvas.getContext('2d');
  context.translate(0.5, 0.5);
  let x = canvas.width/2;
  let y = canvas.height/2;

  function textCenter(text) { //renders text centered on canvas, measuring text width
    context.font = '24px Helvetica';
    context.fillStyle = colors.textColor;
    let len=context.measureText(text).width;
    //kind of have to eyeball the height as measureText won't give you one
    //center and display the text
    context.fillText(text, (x-len/2), y+8);
    context.stroke();
  }

  function drawClock(secondsLeft,secondsElapsed,message='') {
    context.clearRect(0,0,canvas.width, canvas.height);
    let radius = 100;
    let startAngle = 1.5*Math.PI;
    let endAngle = 1.5*Math.PI;
    let counterClockwise = false;
    if (message!==''){ //if there's a message, don't draw anything but the message and return
      context.fillStyle = colors.circleFill;
      context.fill();
      textCenter(message);
      context.beginPath();
      context.arc(x, y, radius, 0, 2*Math.PI, false);
      context.lineWidth = 15;
      context.strokeStyle = colors.progressBarBackground;
      context.stroke();
      return;
    }

    context.beginPath();
    context.arc(x, y, radius, 0, 2*Math.PI, false);
    context.lineWidth = 15;
    context.strokeStyle = colors.progressBarBackground;
    divisions = (2*Math.PI)/(secondsLeft+secondsElapsed);
    context.clearRect(0,0,canvas.width, canvas.height);
    rotation=divisions*secondsElapsed;
    endAngle=startAngle+rotation;

    let timeDisp="";
    if (secondsLeft<10) { timeDisp = "0:0"+parseInt(secondsLeft);}
    else if ((secondsLeft<60)&&(secondsLeft>10)) { timeDisp = "0:"+parseInt(secondsLeft); }
    else {
      //minutes
      timeDisp = Math.floor(secondsLeft/60)+":";
      //and seconds: check if we need to pad seconds with a zero.
      (secondsLeft%60<10) ? timeDisp+=`0${secondsLeft%60}` : timeDisp+=(secondsLeft%60);
    }
    //draw the text
    textCenter(timeDisp);
    //draw the red progress arc
    context.lineWidth = 16;
    context.strokeStyle = colors.progressBar;
    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
    context.stroke();
  }

  function Timer(duration, type, callback) { //duration in milliseconds, type ['POMO','BREAK'], callback upon timer completion
    this.interval = 1000; //ms
    this.paused = true;
    this.timerLength=duration;
    this.startTime;
    this.secondsElapsed=-1; //we set this so it starts ON the time, not on 1 second minus the time
    this.secondsLeft;
    this.Tick;
    this.intervalID;
    this.callback=callback;
    this.type=type;
  }

  Timer.prototype.Start = function () {
    this.paused = false;
    this.intervalID = setInterval(()=>this.Tick(),this.interval);
    this.startTime = new Date(Date.now());
  }

  Timer.prototype.Tick = function () {
    let now = new Date(Date.now());
    this.secondsElapsed++;
    this.secondsLeft=this.timerLength-this.secondsElapsed;
    (this.secondsLeft>=0) ? this.Display() : this.Over();
  }

  Timer.prototype.Recalculate = function () {
      let now = new Date(Date.now());
      this.secondsLeft=this.timerLength-this.secondsElapsed;
  }

  Timer.prototype.Display = function() { drawClock(this.secondsLeft,this.secondsElapsed); }

  Timer.prototype.Add = function(amountToIncrease) { //takes amt to increase in minutes
    if (!this.paused) {
    this.Pause();
    this.timerLength+=amountToIncrease*60
    this.Recalculate();
    this.Display();
    this.Start();
    }
    return this.timerLength;
  }

  Timer.prototype.Subtract = function(amountToDecrease) { //takes amt to decrease in minutes
    console.log('subtract');
    if (!this.paused) {
      this.Pause();
      let mod=amountToDecrease*60;
      if (mod<this.secondsLeft) {
        this.timerLength-=mod;
        this.Recalculate();
        this.Display();
      }
      this.Start();
    }
    return this.timerLength;
  }

  Timer.prototype.Over = function() {
    clearInterval(this.intervalID);
    (this.callback()) ? this.callback() : null;
  }

  Timer.prototype.Reset = function() {
    console.log(this);
    (!this.paused) ? this.Pause() : null;
    console.log(this.secondsElapsed);
    this.secondsElapsed=-1;
    this.Recalculate();
    this.Pause();
  }

  Timer.prototype.Pause = function () {
    (this.paused = !this.paused) ? clearInterval(this.intervalID) : this.Start();
  }

  let timerType='POMO';
  let pomoCt=0;
  let thisTimer = new Timer(pomoDuration, timerType, clockCallback); //start with a pomodoro
  thisTimer.Start();

  function clockCallback() { //switch between pomodoro mode and break mode
    thisTimer=null;
    let newDuration;
    (timerType==='POMO') ? drawClock(null,null,'Time for a break.') : drawClock(null,null,'Time to work!');
    if (timerType==='POMO') {
      pomoCt++;
      pomoCount.innerHTML=pomoCt;
      timerType='BREAK'
      newDuration=breakDuration;
    }
    else {
      timerType='POMO';
      newDuration=pomoDuration;
    }
    thisTimer = new Timer(newDuration, timerType, clockCallback);
    setTimeout(function() {
      thisTimer.Start();
    },1000);
  }
}
