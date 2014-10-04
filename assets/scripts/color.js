
// rgb from 0..255
// hsv: h 0..360 s 0..255 v 0..255 

var ctiny=0.1;

var Color=function(value) {
  this.r=0; // 0..255
  this.g=0; // 0..255
  this.b=0; // 0..255
  this.opacity=1; // 0..1
  this.equals=function(color) {
    return (equals(this.r,color.r) &&
            equals(this.g,color.g) &&
            equals(this.b,color.b) &&
            equals(this.opacity,color.opacity));
  };
  this.adjustAsBackground=function() {
    this.setHsvComponentSaturation(clamp(0, this.getHsvComponentSaturation(), 90));
    this.setHsvComponentValue(clamp(128, this.getHsvComponentValue(), 255));
    return this;
  },
  this.getOpacity=function() {
    return(this.opacity);
  };
  this.setOpacity=function(opacity) {
    this.opacity=opacity;
    return this;
  };
  this.setColorTemperatureValue=function(temp) {
    temp /= 100;

    if(temp < 66) {
      this.r = 255;
    } else {
      this.r = temp - 60;
      this.r = 329.698727446 * Math.pow(this.r, -0.1332047592)
    }      
    this.r = clamp(0, this.r, 255);

    if(temp < 66) {
      this.g = temp;
      this.g = 99.4708025861 * Math.log(this.g) - 161.1195681661
    } else {
      this.g = temp - 60;
      this.g = 288.1221695283 * Math.pow(this.g, -0.0755148492)
    }      
    this.g = clamp(0, this.g, 255);

    if(temp >= 66) {
      this.b = 255;
    } else if(temp <= 19) {
      this.b = 0;
    } else {
      this.b = temp - 10;
      this.b = 138.5177312231 * Math.log(this.b) - 305.0447927307;
    }
    this.b = clamp(0, this.b, 255);

    return this;
  },
  this.setHexValue=function(value) {
    if(value.length < 3)
      return(false);
    if(value[0] == "#")
      value=value.substr(1);
    if(value.length == 3 || value.length == 4) {
      this.r=parseInt(value[0]+value[0],16);
      this.g=parseInt(value[1]+value[1],16);
      this.b=parseInt(value[2]+value[2],16);
      if(value.length == 4)
        this.opacity=parseInt(value[3]+value[3],16)/255;
    } else if(value.length == 6 || value.length == 8) {
      this.r=parseInt(value.substr(0,2),16);
      this.g=parseInt(value.substr(2,2),16);
      this.b=parseInt(value.substr(4,2),16);
      if(value.length == 8)
        this.opacity=parseInt(value.substr(6,2),16)/255;
    } else {
      return(false);
    }
    return this;
  };
  this.parseNumbers=function(value) {
    var numbers=value.split(",");
    var n=[];
    for(var i=0;i<numbers.length;i++) {
      numbers[i]=numbers[i].trim();
      if(!isNumber(numbers[i]))
        return([]);
      n.push(parseFloat(numbers[i]));
    }
    return n;
  };
  this.normalize=function() {
    this.r=clamp(ctiny,this.r,255-ctiny);
    this.g=clamp(ctiny,this.g,255-ctiny);
    this.b=clamp(ctiny,this.b,255-ctiny);
    this.opacity=clamp(0,this.opacity,1);
    return this;
  };
  this.setRgbValue=function(value) {
    if(value.length < 5)
      return(false);
    value=value.trim();
    if(value.indexOf("rgb(") == 0)
      value=value.substr(4);
    if(value.indexOf(")") == value.length-1)
      value=value.substr(0,value.length-1);
    var numbers=this.parseNumbers(value);
    if(numbers.length != 3)
      return(false);
    this.r=numbers[0];
    this.g=numbers[1];
    this.b=numbers[2];
    this.normalize();
    return(true);
  };
  this.setRgbaValue=function(value) {
    if(value.length < 6)
      return(false);
    value=value.trim();
    if(value.indexOf("rgba(") == 0)
      value=value.substr(5);
    if(value.indexOf(")") == value.length-1)
      value=value.substr(0,value.length-1);
    var numbers=this.parseNumbers(value);
    if(numbers.length != 4)
      return(false);
    this.r=numbers[0];
    this.g=numbers[1];
    this.b=numbers[2];
    this.a=numbers[3];
    this.normalize();
    return(true);
  };
  this.convertRgbToHsv=function(rgb) {
    var r=clamp(ctiny,rgb[0],255-ctiny)/255;
    var g=clamp(ctiny,rgb[1],255-ctiny)/255;
    var b=clamp(ctiny,rgb[2],255-ctiny)/255;
    if(r == g && g == b)
      return([0,0,r*255]);
    var min,max,delta;
    var h=s=v=0;
    min=Math.min(r,g,b);
    max=Math.max(r,g,b);
    v=max;
    delta=max-min;
    if(max != 0) {
      s=delta/max;
    } else {
      s=0;
      h=0.001;
      return([h,s,v]);
    }
    if(r==max )
      h=(g-b)/delta;
    else if(g == max)
      h=2+(b-r)/delta;
    else
      h=4+(r-g)/delta;
    h*=60;
    if(h<0)
      h+=360;
    s*=255;
    v*=255;
    s=clamp(ctiny,s,255-ctiny);
    v=clamp(ctiny,v,255-ctiny);
    return([h,s,v]);
  };
  this.convertHsvToRgb=function(hsv) {
    var h=hsv[0]/60;
    var s=hsv[1]/255;
    var v=hsv[2]/255;
    s=clamp(ctiny,s,255-ctiny);
    v=clamp(ctiny,v,255-ctiny);
    var i,f,p,q,t;
    if(s == 0)
      return([v,v,v]);
    i=Math.floor(h);
    f=h-i;// factorial part of h
    p=v*(1-s);
    q=v*(1-s*f);
    t=v*(1-s*(1-f));
    switch(i) {
    case 0:
      r=v;
      g=t;
      b=p;
      break;
    case 1:
      r=q;
      g=v;
      b=p;
      break;
    case 2:
      r=p;
      g=v;
      b=t;
      break;
    case 3:
      r=p;
      g=q;
      b=v;
      break;
    case 4:
      r=t;
      g=p;
      b=v;
      break;
    default:
      r=v;
      g=p;
      b=q;
      break;
    }
    r*=255;
    g*=255;
    b*=255;
    r=clamp(ctiny,r,255-ctiny);
    g=clamp(ctiny,g,255-ctiny);
    b=clamp(ctiny,b,255-ctiny);
    return([r,g,b]);
  };
  this.setHsvValue=function(value) {
    value=value.trim();
    if(value.indexOf("hsv(") == 0)
      value=value.substr(4);
    if(value.indexOf(")") == value.length-1)
      value=value.substr(0,value.length-1);
    var numbers=this.parseNumbers(value);
    if(numbers.length != 3)
      return(false);
    numbers=this.convertHsvToRgb(numbers);
    this.r=numbers[0];
    this.g=numbers[1];
    this.b=numbers[2];
    this.normalize();
    return(true);
  };
  this.setHsvComponentHue=function(hue) {
    var hsv=this.convertRgbToHsv([this.r,this.g,this.b]);
    hsv[0]=hue;
    var rgb=this.convertHsvToRgb(hsv);
    this.r=rgb[0];
    this.g=rgb[1];
    this.b=rgb[2];
    this.normalize();
  };
  this.setHsvComponentSaturation=function(saturation) {
    var hsv=this.convertRgbToHsv([this.r,this.g,this.b]);
    hsv[1]=saturation;
    var rgb=this.convertHsvToRgb(hsv);
    this.r=rgb[0];
    this.g=rgb[1];
    this.b=rgb[2];
    this.normalize();
  };
  this.setHsvComponentValue=function(value) {
    var hsv=this.convertRgbToHsv([this.r,this.g,this.b]);
    hsv[2]=value;
    var rgb=this.convertHsvToRgb(hsv);
    this.r=rgb[0];
    this.g=rgb[1];
    this.b=rgb[2];
    this.normalize();
  };
  this.getHsvComponentHue=function() {
    var hsv=this.convertRgbToHsv([this.r,this.g,this.b]);
    return(hsv[0]);
  };
  this.getHsvComponentSaturation=function() {
    var hsv=this.convertRgbToHsv([this.r,this.g,this.b]);
    return(hsv[1]);
  };
  this.getHsvComponentValue=function() {
    var hsv=this.convertRgbToHsv([this.r,this.g,this.b]);
    return(hsv[2]);
  };
  this.getHexValue=function() {
    var r=lpad(parseInt(this.r).toString(16),2);
    var g=lpad(parseInt(this.g).toString(16),2);
    var b=lpad(parseInt(this.b).toString(16),2);
    return "#"+r+g+b;
  };
  this.getHexoValue=function() {
    var r=lpad(parseInt(this.r).toString(16),2);
    var g=lpad(parseInt(this.g).toString(16),2);
    var b=lpad(parseInt(this.b).toString(16),2);
    var o=lpad(parseInt(this.opacity*255).toString(16),2);
    return "#"+r+g+b+o;
  };
  this.setInternalValue=function(value) {
    var rgba=value.substr(1).split(":");
    this.r=rgba[0];
    this.g=rgba[1];
    this.b=rgba[2];
    this.opacity=rgba[3];
  };
  this.getInternalValue=function() {
    return ":"+[this.r,this.g,this.b,this.opacity].join(":");
  };
  this.getSaveableValue=function() {
    return this.getInternalValue();
  };
  this.getRgbValue=function() {
    return "rgb("+[parseInt(this.r),parseInt(this.g),parseInt(this.b)].join(",")+")";
  };
  this.getRgbaValue=function() {
    return "rgba("+
      [parseInt(this.r),parseInt(this.g),parseInt(this.b),
       parseFloat(this.opacity).toFixed(2)].join(",")+")";
  };
  this.getCssValue=function() {
    return(this.getRgbaValue());
  };
  this.isHexValue=function(value) {
    if(value[0] == "#")
      return true;
    if(value.length != 3 &&
       value.length != 4 &&
       value.length != 6 && 
       value.length != 8)
      return false;
    for(var i=0;i<value.length;i++) {
      if(!isHex(value[i]))
        return false;
    }
    return true;
  };
  this.setValue=function(value) {
    if(typeof value == typeof this)
      return this.setInternalValue(value.getInternalValue());
    else if(value[0] == ":")
      return this.setInternalValue(value);
    else if(value.indexOf("hsv") == 0)
      return this.setHsvValue(value);
    else if(value.indexOf("rgba") == 0)
      return this.setRgbaValue(value);
    else if(value.indexOf("rgb") == 0)
      return this.setRgbValue(value);
    else if(value.trim().toLowerCase().indexOf("holo") > -1)
      this.setHexValue("#33b5e5");
    else if(this.isHexValue(value))
      return this.setHexValue(value);
    else if(value.substr(value.length-2, 1).toLowerCase() == "k")
      return this.setColorTemperatureValue(value.substr(0, value.length-1));
    return null;
  };
  this.blend=function(color,amount) { // returns new color <amount> way between
    var c=new Color();
    c.r=crange(0,amount,1,this.r,color.r);
    c.g=crange(0,amount,1,this.g,color.g);
    c.b=crange(0,amount,1,this.b,color.b);
    c.opacity=crange(0,amount,1,this.opacity,color.opacity);
    return c;
  };
  this.blendHsv=function(color,amount) { // same as Color.blend, but blends HSV instead
    var hsv_a=this.convertRgbToHsv([this.r,this.g,this.b]);
    var hsv_b=this.convertRgbToHsv([color.r,color.g,color.b]);
    var h=crange(0,amount,1,hsv_a[0],hsv_b[0]);
    var s=crange(0,amount,1,hsv_a[1],hsv_b[1]);
    var v=crange(0,amount,1,hsv_a[2],hsv_b[2]);
    var rgb=this.convertHsvToRgb([h,s,v]);
    var c=new Color();
    c.r=rgb[0];
    c.g=rgb[1];
    c.b=rgb[2];
    c.opacity=crange(0,amount,1,this.opacity,color.opacity);
    return c;
  };
  if(value)
    this.setValue(value);
};
