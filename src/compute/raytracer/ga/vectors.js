function log10(x) {
    return Math.log(x)/Math.LN10;
}

function roundToNdigits(x, N) {
    var scaler = Math.floor(log10(x)) + 1;
    scaler = Math.pow(10,scaler-N);
    x = x/scaler;
    x = Math.round(x);
    x = x*scaler;
    return x;
}

function toDeg(a) {
    return 180*a/M_PI;
}

//
// Vec2 class for 2D vector operations
//
function Vec2(x, y) {
    if (y == undefined) {
	this.x = x.x;
	this.y = x.y;
    } else {
	this.x = x;    
	this.y = y;
    }
}


function getDir(p0, p1) {
    var d = new Vec2(p1);
    d.sub(p0);
    return d;
}

function getNormal(p0, p1) {
    var d = getDir(p0, p1);
    return new Vec2(d.y, -d.x);
}

Vec2.prototype.set = function(x,y){
    if (y == undefined) {
        this.x = x.x;
        this.y = x.y;
    } else {
        this.x = x;
        this.y = y;
    }
};

Vec2.prototype.setUnitVector = function(ang){
    this.x = Math.cos(ang);
    this.y = Math.sin(ang);
};

Vec2.prototype.scale = function(s) {
    this.x = this.x*s;
    this.y = this.y*s;
};

Vec2.prototype.add = function(v2) {
    this.x = this.x + v2.x;
    this.y = this.y + v2.y;
};

function vec2Add(v1, v2) {
    var v=new Vec2(v1);
    v.add(v2);
    return v;
}

Vec2.prototype.sub = function(v2) {
    this.x = this.x - v2.x;
    this.y = this.y - v2.y;
};

// Distances and lengths are internally represented in an internal coordinate system
Vec2.prototype.len = function() {
    return(Math.sqrt(this.x*this.x + this.y*this.y));
};

Vec2.prototype.normalize = function() {
    var l=this.len();
    this.scale(1/l);
};

Vec2.prototype.relativeScale = function(p, s) {
    this.sub(p);
    this.scale(s);
    this.add(p);
};

Vec2.prototype.distance = function(v) {
    var dx = this.x- v.x;
    var dy = this.y- v.y;
    return(Math.sqrt(dx*dx + dy*dy));
};

// The internally represented speed of sound has a value of 1 spatial unit in 1 temporal unit.
// I wouldn't dare to touch this constant, as it's value is assumed to be one elsewhere (GA_receiver).
var speedOfSound = 1;

Vec2.prototype.timeOfFlight = function(dest) {
    var v;
    if (dest)
        v = getDir(this, dest);
    else
        v = this;
    return (v.len() / speedOfSound);
};

Vec2.prototype.scaleToTime = function(t) {
    this.normalize();
    this.scale(t * speedOfSound);
};

Vec2.prototype.dot = function(v2) {
    return this.x*v2.x + this.y*v2.y;
};

// Reflect 'this' against line going through center and having normalized direction l
Vec2.prototype.reflect = function(l, center) {
    var v = getDir(center, this);
    var v_dot_l = v.dot(l);
    var r = new Vec2(l);
    r.scale(2*v_dot_l);
    r.sub(v);
    r.add(center);
    return r;
};

// Intersection of two lines of form l = p + t*s
// returns t for line: p1 + t*s1
function intersect(p0, s0, p1, s1) {
    var scaler = s0.x*s1.y - s1.x*s0.y;
    if(scaler == 0){
        return null; //Lines are parallel
    }else{
        return (s0.x*(p0.y - p1.y) - s0.y*(p0.x - p1.x)) / scaler
    }
}

function intersectionPoint(p0, s0, p1, s1) {
    var t=intersect(p0, s0, p1, s1);
    var ip = new Vec2(s1);
    ip.scale(t);
    ip.add(p1);
    return ip;
}

function segmentsIntersect(p0, s0, p1, s1, mult) {
    var eps = mult * EPS;
    var t = intersect(p0, s0, p1, s1);
    if ((t>eps) && (t<(1-eps))) {
        t = intersect(p1, s1, p0, s0);
        if ((t > eps) && (t < (1-eps)))
            return true;
    }
    return false;
}

function getLineOrientation(p0, p1) {
    return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}

Vec2.prototype.inFrontOfPlane = function(c, norm) {
    var pointToCenter = getDir(this, c);
    return (pointToCenter.dot(norm) < 0);
};

Vec2.prototype.print = function(txt) {
    console.log(txt + " = [" + this.x + "," + this.y + "]");
};
