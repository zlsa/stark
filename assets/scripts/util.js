
window.AudioContext = window.AudioContext||window.webkitAudioContext;

(function() {
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				 timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());

function capitalize(s) {
  return s[0].toUpperCase() + s.substr(1);
}

function flatten(a) {
  var out = [];
  for(var i=0;i<a.length;i++) {
    if(typeof a[i] == typeof []) {
      out.push.apply(out, flatten(a[i]));
    } else {
      out.push(a[i]);
    }
  }
  return out;
}

function isHex(c) {
    if("0123456789abcdef".indexOf(c.toLowerCase()) > -1)
        return true;
    return false;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) || n == ".";
}

var sin_cache={};

function sin(v) {
  return(Math.sin(v));
  if(!v in sin_cache)
    sin_cache[v]=Math.sin(v);
  return(sin_cache[v]);
}

function cos(v) {
  return(sin(v+Math.PI/2));
}

function normalize(v,length) {
  var x=v[0];
  var y=v[1];
  var angle=Math.atan2(x,y);
  if(!length)
    length=1;
  return([
    sin(angle)*length,
    cos(angle)*length
  ]);
}

function fl(n) {
  return Math.floor(n);
}

function randint(l,h) {
  return(Math.floor(Math.random()*(h-l+1))+l);
}

function random(l,h) {
  return(Math.random()*(h-l)+l);
}

function elements(obj) {
  var n=0;
  for(var i in obj)
    n+=1;
  return n;
}

function s(i) {
  if(i == 1)
    return "";
  else
    return "s";
}

function within(n,c,r) {
  if((n > c+r) || (n < c-r))
    return false;
  return true;
}

function trange(il,i,ih,ol,oh) {
  return(ol+(oh-ol)*(i-il)/(ih-il));
  i=(i/(ih-il))-il;
  return (i*(oh-ol))+ol;
}

function clamp(l,i,h) {
  if(h == null) {
    if(l > i)
      return l;
    return i;
  }
  var temp;
  if(l > h) {
    temp=h;
    h=l;
    l=temp;
  }
  if(l > i)
    return l;
  if(h < i)
    return h;
  return i;
}

function crange(il,i,ih,ol,oh) {
  return clamp(ol,trange(il,i,ih,ol,oh),oh);
}

function srange(il,i,ih,ol,oh) {
  return trange(-1,Math.sin(trange(il,i,ih,-Math.PI/2,Math.PI/2)),1,ol,oh);
}

function scrange(il,i,ih,ol,oh) {
  return srange(-1,Math.sin(crange(il,i,ih,-Math.PI/2,Math.PI/2)),1,ol,oh);
}

function distance2d(a,b) {
  if(!b) b = [0, 0];
  var x=a[0]-b[0];
  var y=a[1]-b[1];
  return Math.sqrt((x*x)+(y*y));
}

function degrees(radians) {
  return (radians/(Math.PI*2))*360;
}

function radians(degrees) {
  return (degrees/360)*(Math.PI*2);
}

function choose(l) {
  return l[Math.floor(Math.random()*l.length)];
}

function mod(a, n) {
    return ((a%n)+n)%n;
};

var AU = 60000;

function to_distance(d) {
  function r(d, p) {
    var n = 0;
    if(p == 0) n = Math.round(p);
    else       n = d.toFixed(p);

    return to_comma(n, false);
  };
  if(d < 50) {
    return r(d / 1000, 2) + " m";
  } else if(d > AU * 0.3) {
    return r(d / AU, 2) + " au";
  } else {
    return to_comma(Math.round(d), true) + " km";
  }
}

var thousand    = 1000;
var million     = 1000000;
var billion     = 1000000000;
var trillion    = 1000000000000;
var quadrillion = 1000000000000000;
var quintillion = 1000000000000000000;
var sextillion  = 1000000000000000000000;
var septillion  = 1000000000000000000000000;

function to_number(d, truncate) {
  function r(d, p) {
    var n = 0;
    if(p == 0) n = Math.round(p);
    else       n = d.toFixed(p);

    return to_comma(n, truncate);
  };
  var threshold = 1.2;
  if(d < threshold * thousand * million) {
    return to_comma(Math.round(d), true);
//  } else if(d < threshold * million) {
//    return r(d / thousand, 2) + " thousand";
  } else if(d < threshold * billion) {
    return r(d / million, 2) + " million";
  } else if(d < threshold * trillion) {
    return r(d / billion, 2) + " billion";
  } else if(d < threshold * quadrillion) {
    return r(d / trillion, 2) + " trillion";
  } else if(d < threshold * quintillion) {
    return r(d / quadrillion, 2) + " quadrillion";
  } else if(d < threshold * sextillion) {
    return r(d / quintillion, 2) + " quintillion";
  } else if(d < threshold * septillion) {
    return r(d / sextillion, 2) + " sextillion";
  } else {
    return r(d / septillion, 2) + " septillion";
  }
}

function to_comma(number, truncate) {
  var num = Math.abs(number);
  var n = Math.floor(num);

  var buf = [];

  var ns = n + "";
  for(var i=ns.length;i>=3;i-=3) {
    buf.push(ns.substr(i-3, 3));
  }

  if(i > 0) buf.push(ns.substr(0, i));

  buf.reverse();

  var fractional = mod(num, 1).toFixed(2) + "";

  var prefix = "";
  if(number < 0) prefix = "-";

  buf = buf.join(",");

  if(truncate)
    return prefix + buf;

  return prefix + buf + "." + fractional.substr(fractional.indexOf(".") + 1);
}

function angle_difference(a, b) {
  a = degrees(a);
  b = degrees(b);
  var invert=false;
  if(b > a) {
    invert=true;
    var temp=a;
    a=b;
    b=temp;
  }
  var difference=mod(a-b, 360);
  if(difference > 180) difference -= 360;
  if(invert) difference *= -1;
  difference = radians(difference);
  return difference;
}

function sr(seed, slowdown) {
  if(!slowdown) slowdown = 1;
  var t = time() * slowdown;
  return Math.sin(t + seed) * 0.2 + Math.sin((t + seed) * 2 + 2898) * 0.2 + Math.sin((t + seed - 198498) * 0.5) * 0.2;
}

function srt(seed, t, slowdown) {
  if(!slowdown) slowdown = 1;
  t *= slowdown;
  return Math.sin(t + seed) * 0.2 + Math.sin((t + seed) * 1.53 + 2898) * 0.2 + Math.sin((t + seed - 198498) * 0.82) * 0.2 + Math.sin((t + seed - 2982) * 0.1) * 0.3;
}

var Lowpass=function(mix) {
  this.target = 0;
  this.value = 0;

  this.mix = mix / 30;

  this.tick=function(d) {
    var mix = 1 - ((1-this.mix) * d);
    this.value = (this.target * (1-mix)) + (this.value * mix);
  };
};

function choose_weight(l) {
  if(l.length == 0) return;
  if(typeof l[0] != typeof []) return choose(l);
  // l = [[item, weight], [item, weight] ... ];
  var weight  = 0;
  for(var i=0;i<l.length;i++) {
    weight += l[i][1];
  }
  var random = Math.random() * weight;
  weight     = 0;
  for(var i=0;i<l.length;i++) {
    weight += l[i][1];
    if(weight > random) {
      return l[i][0];
    }
  }
  console.log("OHSHIT");
  return(null);
}

function weed_list(l, constraint) {
  var weeded = [];
  for(var i=0;i<l.length;i++) {
    if(constraint(l[i])) weeded.push(l[i]);
  }
  return weeded;
}

function start_time() {
  return time();
}

function end_time(t, message) {
  var tm = time();
  var elapsed = (tm - t).toFixed(3);
  console.log(elapsed + " seconds elapsed: " + message);
  return tm;
}

function sign(n) {
  if(n < 0) return -1;
  return 1;
}

function to_percent(n) {
  return Math.round(n * 100) + "%";
}

function to_ship_weight(n) {
  return to_number(n * 1000);
}

function to_system_weight(n) {
  return to_number(n * 1000000000000000000);
}
