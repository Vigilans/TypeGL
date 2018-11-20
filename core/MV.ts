function _argumentsToArray( args )
{
    return [].concat.apply( [], Array.prototype.slice.apply(args) );
}

export interface Matrix extends Array<number[]> {
    matrix?: boolean;
}

export type Tensor = number | Array<number> | Matrix;

export function isMatrix(v: Tensor): v is Matrix {
    return (<Matrix>v).matrix;
}

export function isVector(v: Tensor): v is Array<number> {
    return !isMatrix(v) && Array.isArray(v);
}

export function isScalar(v: Tensor): v is number {
    return typeof v === "number";
}

//----------------------------------------------------------------------------

export function radians( degrees: number ) {
    return degrees * Math.PI / 180.0;
}

//----------------------------------------------------------------------------
//
//  Vector Constructors
//

export function vec2(...numbers: number[])
{
    var result = _argumentsToArray( numbers );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    }

    return result.splice( 0, 2 );
}

export function vec3(...numbers: number[])
{
    var result = _argumentsToArray( numbers );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    }

    return result.splice( 0, 3 );
}

export function vec4(...numbers: number[])
{
    var result = _argumentsToArray( numbers );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    case 3: result.push( 1.0 );
    }

    return result.splice( 0, 4 );
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

export function mat2(...numbers: number[])
{
    var v = _argumentsToArray( numbers );

    var m = [] as Matrix;
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec2( v[0],  0.0 ),
            vec2(  0.0, v[0] )
        ];
        break;

    default:
        m.push( vec2(v) );  v.splice( 0, 2 );
        m.push( vec2(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

export function mat3(...numbers: number[])
{
    var v = _argumentsToArray( numbers );

    var m = [] as Matrix;
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec3( v[0],  0.0,  0.0 ),
            vec3(  0.0, v[0],  0.0 ),
            vec3(  0.0,  0.0, v[0] )
        ];
        break;

    default:
        m.push( vec3(v) );  v.splice( 0, 3 );
        m.push( vec3(v) );  v.splice( 0, 3 );
        m.push( vec3(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

export function mat4(...numbers: number[])
{
    var v = _argumentsToArray( numbers );

    var m = [] as Matrix;
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec4( v[0], 0.0,  0.0,   0.0 ),
            vec4( 0.0,  v[0], 0.0,   0.0 ),
            vec4( 0.0,  0.0,  v[0],  0.0 ),
            vec4( 0.0,  0.0,  0.0,  v[0] )
        ];
        break;

    default:
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

export function equal( u: Tensor, v: Tensor )
{
    if (typeof u === "number" && typeof v === "number") {
        return u === v;
    } 
    else if (typeof u === "number" || typeof v === "number") {
        throw "trying to add number with non-number"
    }

    if ( u.length != v.length ) { return false; }

    if ( isMatrix(u) && isMatrix(v) ) {
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) { return false; }
            for ( var j = 0; j < u[i].length; ++j ) {
                if ( u[i][j] !== v[i][j] ) { return false; }
            }
        }
    }
    else if ( isMatrix(u) && !isMatrix(v) || !isMatrix(u) && isMatrix(v) ) {
        return false;
    }
    else {
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i] !== v[i] ) { return false; }
        }
    }

    return true;
}

//----------------------------------------------------------------------------

function add_impl( u: Matrix, v: Matrix ): Matrix;
function add_impl( u: Array<number>, v: Array<number> ): Array<number>;
function add_impl( u: number, v: number ): number;
function add_impl( u, v )
{
    if ( isMatrix(u) && isMatrix(v) ) {

        if ( u.length != v.length ) {
            throw "add(): trying to add matrices of different dimensions";
        }
    
        let result = [] as Matrix;
    
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "add(): trying to add matrices of different dimensions";
            }
            result.push( [] );
            for ( var j = 0; j < u[i].length; ++j ) {
                result[i].push( u[i][j] + v[i][j] );
            }
        }
    
        result.matrix = true;
    
        return result;
    }
    else if ( isVector(u) && isVector(v) ) {
        if ( u.length != v.length ) {
            throw "add(): vectors are not the same dimension";
        }

        let result = [] as Array<number>;

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] + v[i] );
        }

        return result;
    }
    else if ( isScalar(u) && isScalar(v) ) {
        return u + v;
    } 
    else {
        throw "add(): trying to add variables of different type";
    }
}

//----------------------------------------------------------------------------

function subtract_impl( u: Matrix, v: Matrix ): Matrix;
function subtract_impl( u: Array<number>, v: Array<number> ): Array<number>;
function subtract_impl( u: number, v: number ): number;
function subtract_impl( u, v )
{
    if ( isMatrix(u) && isMatrix(v) ) {
        if ( u.length != v.length ) {
            throw "subtract(): trying to subtract matrices" +
                " of different dimensions";
        }

        let result = [] as Matrix;

        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) {
                throw "subtract(): trying to subtact matrices" +
                    " of different dimensions";
            }
            result.push( [] );
            for ( var j = 0; j < u[i].length; ++j ) {
                result[i].push( u[i][j] - v[i][j] );
            }
        }

        result.matrix = true;

        return result;
    }
    else if ( isVector(u) && isVector(v) ) {
        if ( u.length != v.length ) {
            throw "subtract(): vectors are not the same length";
        }

        let result = [] as Array<number>;

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] - v[i] );
        }

        return result;
    }
    else if ( isScalar(u) && isScalar(v) ) {
        return u - v;
    }
    else {
        throw "subtact(): trying to subtact variables of different type";
    }
}

//----------------------------------------------------------------------------

function mult_impl( u: Matrix, v: Matrix ): Matrix;
function mult_impl( u: Array<number>, v: Array<number> ): Array<number>;
function mult_impl( u: number, v: number ): number;
function mult_impl( u, v )
{
    if ( isMatrix(u) && isMatrix(v) ) {

        let result = [] as Matrix;

        for ( var i = 0; i < u.length; ++i ) {
            result.push( [] );

            for ( var j = 0; j < v[0].length; ++j ) {
                var sum = 0.0;
                if ( u[i].length != v.length ) {
                    throw "mult(): trying to mult matrices that dimensions do not match";
                }
                for ( var k = 0; k < v.length; ++k ) {
                    sum += u[i][k] * v[k][j];
                }
                result[i].push( sum );
            }
        }

        result.matrix = true;

        return result;
    }
    else if ( isVector(u) && isVector(v) ) {
        if ( u.length != v.length ) {
            throw "mult(): vectors are not the same dimension";
        }

        let result = [] as Array<number>;

        for ( var i = 0; i < u.length; ++i ) {
            result.push( u[i] * v[i] );
        }

        return result;
    }
    else if ( isScalar(u) && isScalar(v) ) {
        return u * v;
    }
    else {
        throw "mult(): trying to mult variables of different type"
    }
}

export function add(...vals: number[]): number;
export function add(...vals: Array<number>[]): Array<number>;
export function add(...vals: Matrix[]): Matrix;
export function add(...vals) {
    switch ( vals.length ) {
        case 0: return undefined;
        case 1: return vals[0];
        case 2: return add_impl(vals[0], vals[1]);
        default: return add_impl(vals[0], add(...vals.slice(1)));
    }
}

export function subtract(...vals: number[]): number;
export function subtract(...vals: Array<number>[]): Array<number>;
export function subtract(...vals: Matrix[]): Matrix;
export function subtract(...vals) {
    switch ( vals.length ) {
        case 0: return undefined;
        case 1: return vals[0];
        case 2: return subtract_impl(vals[0], vals[1]);
        default: return subtract_impl(vals[0], subtract(...vals.slice(1)));
    }
}

export function mult(...vals: number[]): number;
export function mult(...vals: Array<number>[]): Array<number>;
export function mult(...vals: Matrix[]): Matrix;
export function mult(...vals) {
    switch ( vals.length ) {
        case 0: return undefined;
        case 1: return vals[0];
        case 2: return mult_impl(vals[0], vals[1]);
        default: return mult_impl(vals[0], mult(...vals.slice(1)));
    }
}

//----------------------------------------------------------------------------
//
//  Basic Transformation Matrix Generators
//

export function translate( x, y, z )
{
    if ( Array.isArray(x) && x.length == 3 ) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    var result = mat4();
    result[0][3] = x;
    result[1][3] = y;
    result[2][3] = z;

    return result;
}

//----------------------------------------------------------------------------

export function rotate( angle, axis )
{
    if ( !Array.isArray(axis) ) {
        axis = [ arguments[1], arguments[2], arguments[3] ];
    }

    var v = normalize( axis );

    var x = v[0];
    var y = v[1];
    var z = v[2];

    var c = Math.cos( radians(angle) );
    var omc = 1.0 - c;
    var s = Math.sin( radians(angle) );

    var result = mat4(
        vec4( x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s, 0.0 ),
        vec4( x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s, 0.0 ),
        vec4( x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c,   0.0 ),
        vec4()
    );

    return result;
}

export function rotateX(theta) {
  var c = Math.cos( radians(theta) );
  var s = Math.sin( radians(theta) );
  var rx = mat4( 1.0,  0.0,  0.0, 0.0,
      0.0,  c,  s, 0.0,
      0.0, -s,  c, 0.0,
      0.0,  0.0,  0.0, 1.0 );
  return rx;
}
export function rotateY(theta) {
  var c = Math.cos( radians(theta) );
  var s = Math.sin( radians(theta) );
  var ry = mat4( c, 0.0, -s, 0.0,
      0.0, 1.0,  0.0, 0.0,
      s, 0.0,  c, 0.0,
      0.0, 0.0,  0.0, 1.0 );
  return ry;
}
export function rotateZ(theta) {
  var c = Math.cos( radians(theta) );
  var s = Math.sin( radians(theta) );
  var rz = mat4( c, s, 0.0, 0.0,
      -s,  c, 0.0, 0.0,
      0.0,  0.0, 1.0, 0.0,
      0.0,  0.0, 0.0, 1.0 );
  return rz;
}


//----------------------------------------------------------------------------

export function scalem( x, y, z )
{
    if ( Array.isArray(x) && x.length == 3 ) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    var result = mat4();
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;

    return result;
}

//----------------------------------------------------------------------------
//
//  ModelView Matrix Generators
//

export function lookAt( eye, at, up )
{
    if ( !Array.isArray(eye) || eye.length != 3) {
        throw "lookAt(): first parameter [eye] must be an a vec3";
    }

    if ( !Array.isArray(at) || at.length != 3) {
        throw "lookAt(): first parameter [at] must be an a vec3";
    }

    if ( !Array.isArray(up) || up.length != 3) {
        throw "lookAt(): first parameter [up] must be an a vec3";
    }

    if ( equal(eye, at) ) {
        return mat4();
    }

    var v = normalize( subtract(at, eye) );  // view direction vector
    var n = normalize( cross(v, up) );       // perpendicular vector
    var u = normalize( cross(n, v) );        // "new" up vector

    v = negate( v );

    var result = mat4(
        vec4( n, -dot(n, eye) ),
        vec4( u, -dot(u, eye) ),
        vec4( v, -dot(v, eye) ),
        vec4()
    );

    return result;
}

//----------------------------------------------------------------------------
//
//  Projection Matrix Generators
//

export function ortho( left, right, bottom, top, near, far )
{
    if ( left == right ) { throw "ortho(): left and right are equal"; }
    if ( bottom == top ) { throw "ortho(): bottom and top are equal"; }
    if ( near == far )   { throw "ortho(): near and far are equal"; }

    var w = right - left;
    var h = top - bottom;
    var d = far - near;

    var result = mat4();
    result[0][0] = 2.0 / w;
    result[1][1] = 2.0 / h;
    result[2][2] = -2.0 / d;
    result[0][3] = -(left + right) / w;
    result[1][3] = -(top + bottom) / h;
    result[2][3] = -(near + far) / d;

    return result;
}

//----------------------------------------------------------------------------

export function perspective( fovy, aspect, near, far )
{
    var f = 1.0 / Math.tan( radians(fovy) / 2 );
    var d = far - near;

    var result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}

//----------------------------------------------------------------------------
//
//  Matrix Functions
//

export function transpose( m )
{
    if ( !m.matrix ) {
        return "transpose(): trying to transpose a non-matrix";
    }

    var result = [] as Matrix;
    for ( var i = 0; i < m.length; ++i ) {
        result.push( [] );
        for ( var j = 0; j < m[i].length; ++j ) {
            result[i].push( m[j][i] );
        }
    }

    result.matrix = true;

    return result;
}

//----------------------------------------------------------------------------
//
//  Vector Functions
//

export function dot( u, v )
{
    if ( u.length != v.length ) {
        throw "dot(): vectors are not the same dimension";
    }

    var sum = 0.0;
    for ( var i = 0; i < u.length; ++i ) {
        sum += u[i] * v[i];
    }

    return sum;
}

//----------------------------------------------------------------------------

export function negate( u )
{
    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( -u[i] );
    }

    return result;
}

//----------------------------------------------------------------------------

export function cross( u, v )
{
    if ( !Array.isArray(u) || u.length < 3 ) {
        throw "cross(): first argument is not a vector of at least 3";
    }

    if ( !Array.isArray(v) || v.length < 3 ) {
        throw "cross(): second argument is not a vector of at least 3";
    }

    var result = [
        u[1]*v[2] - u[2]*v[1],
        u[2]*v[0] - u[0]*v[2],
        u[0]*v[1] - u[1]*v[0]
    ];

    return result;
}

//----------------------------------------------------------------------------

export function length( u )
{
    return Math.sqrt( dot(u, u) );
}

//----------------------------------------------------------------------------

export function normalize( u, excludeLastComponent? )
{
    if ( excludeLastComponent ) {
        var last = u.pop();
    }

    var len = length( u );

    if ( !isFinite(len) ) {
        throw "normalize: vector " + u + " has zero length";
    }

    for ( var i = 0; i < u.length; ++i ) {
        u[i] /= len;
    }

    if ( excludeLastComponent ) {
        u.push( last );
    }

    return u;
}

//----------------------------------------------------------------------------

export function mix( u, v, s )
{
    if ( typeof s !== "number" ) {
        throw "mix: the last paramter " + s + " must be a number";
    }

    if ( u.length != v.length ) {
        throw "vector dimension mismatch";
    }

    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( (1.0 - s) * u[i] + s * v[i] );
    }

    return result;
}

//----------------------------------------------------------------------------
//
// Vector and Matrix functions
//

export function scale( s, u )
{
    if ( !Array.isArray(u) ) {
        throw "scale: second parameter " + u + " is not a vector";
    }

    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( s * u[i] );
    }

    return result;
}

//----------------------------------------------------------------------------
//
//
//

export function flatten( v )
{
    if ( isMatrix(v) ) {
        v = transpose( v );
    }

    var n = v.length;
    var elemsAreArrays = false;

    if ( Array.isArray(v[0]) ) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array( n );

    if ( elemsAreArrays ) {
        var idx = 0;
        for ( var i = 0; i < v.length; ++i ) {
            for ( var j = 0; j < v[i].length; ++j ) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for ( var i = 0; i < v.length; ++i ) {
            floats[i] = v[i];
        }
    }

    return floats;
}

//----------------------------------------------------------------------------

var sizeof = {
    'vec2' : new Float32Array( flatten(vec2()) ).byteLength,
    'vec3' : new Float32Array( flatten(vec3()) ).byteLength,
    'vec4' : new Float32Array( flatten(vec4()) ).byteLength,
    'mat2' : new Float32Array( flatten(mat2()) ).byteLength,
    'mat3' : new Float32Array( flatten(mat3()) ).byteLength,
    'mat4' : new Float32Array( flatten(mat4()) ).byteLength
};

// new functions 5/2/2015

// printing

export function printm(m)
{
    if(m.length == 2)
    for(var i=0; i<m.length; i++)
       console.log(m[i][0], m[i][1]);
    else if(m.length == 3)
    for(var i=0; i<m.length; i++)
       console.log(m[i][0], m[i][1], m[i][2]);
    else if(m.length == 4)
    for(var i=0; i<m.length; i++)
       console.log(m[i][0], m[i][1], m[i][2], m[i][3]);
}
// determinants

export function det2(m)
{

     return m[0][0]*m[1][1]-m[0][1]*m[1][0];

}

export function det3(m)
{
     var d = m[0][0]*m[1][1]*m[2][2]
           + m[0][1]*m[1][2]*m[2][0]
           + m[0][2]*m[2][1]*m[1][0]
           - m[2][0]*m[1][1]*m[0][2]
           - m[1][0]*m[0][1]*m[2][2]
           - m[0][0]*m[1][2]*m[2][1]
           ;
     return d;
}

export function det4(m)
{
     var m0 = [
         vec3(m[1][1], m[1][2], m[1][3]),
         vec3(m[2][1], m[2][2], m[2][3]),
         vec3(m[3][1], m[3][2], m[3][3])
     ];
     var m1 = [
         vec3(m[1][0], m[1][2], m[1][3]),
         vec3(m[2][0], m[2][2], m[2][3]),
         vec3(m[3][0], m[3][2], m[3][3])
     ];
     var m2 = [
         vec3(m[1][0], m[1][1], m[1][3]),
         vec3(m[2][0], m[2][1], m[2][3]),
         vec3(m[3][0], m[3][1], m[3][3])
     ];
     var m3 = [
         vec3(m[1][0], m[1][1], m[1][2]),
         vec3(m[2][0], m[2][1], m[2][2]),
         vec3(m[3][0], m[3][1], m[3][2])
     ];
     return m[0][0]*det3(m0) - m[0][1]*det3(m1)
         + m[0][2]*det3(m2) - m[0][3]*det3(m3);

}

export function det(m)
{
     if(m.matrix != true) console.log("not a matrix");
     if(m.length == 2) return det2(m);
     if(m.length == 3) return det3(m);
     if(m.length == 4) return det4(m);
}

//---------------------------------------------------------

// inverses

export function inverse2(m)
{
     var a = mat2();
     var d = det2(m);
     a[0][0] = m[1][1]/d;
     a[0][1] = -m[0][1]/d;
     a[1][0] = -m[1][0]/d;
     a[1][1] = m[0][0]/d;
     a.matrix = true;
     return a;
}

export function inverse3(m)
{
    var a = mat3();
    var d = det3(m);

    var a00 = [
       vec2(m[1][1], m[1][2]),
       vec2(m[2][1], m[2][2])
    ];
    var a01 = [
       vec2(m[1][0], m[1][2]),
       vec2(m[2][0], m[2][2])
    ];
    var a02 = [
       vec2(m[1][0], m[1][1]),
       vec2(m[2][0], m[2][1])
    ];
    var a10 = [
       vec2(m[0][1], m[0][2]),
       vec2(m[2][1], m[2][2])
    ];
    var a11 = [
       vec2(m[0][0], m[0][2]),
       vec2(m[2][0], m[2][2])
    ];
    var a12 = [
       vec2(m[0][0], m[0][1]),
       vec2(m[2][0], m[2][1])
    ];
    var a20 = [
       vec2(m[0][1], m[0][2]),
       vec2(m[1][1], m[1][2])
    ];
    var a21 = [
       vec2(m[0][0], m[0][2]),
       vec2(m[1][0], m[1][2])
    ];
    var a22 = [
       vec2(m[0][0], m[0][1]),
       vec2(m[1][0], m[1][1])
    ];

   a[0][0] = det2(a00)/d;
   a[0][1] = -det2(a10)/d;
   a[0][2] = det2(a20)/d;
   a[1][0] = -det2(a01)/d;
   a[1][1] = det2(a11)/d;
   a[1][2] = -det2(a21)/d;
   a[2][0] = det2(a02)/d;
   a[2][1] = -det2(a12)/d;
   a[2][2] = det2(a22)/d;

   return a;

}

export function inverse4(m)
{
    var a = mat4();
    var d = det4(m);

    var a00 = [
       vec3(m[1][1], m[1][2], m[1][3]),
       vec3(m[2][1], m[2][2], m[2][3]),
       vec3(m[3][1], m[3][2], m[3][3])
    ];
    var a01 = [
       vec3(m[1][0], m[1][2], m[1][3]),
       vec3(m[2][0], m[2][2], m[2][3]),
       vec3(m[3][0], m[3][2], m[3][3])
    ];
    var a02 = [
       vec3(m[1][0], m[1][1], m[1][3]),
       vec3(m[2][0], m[2][1], m[2][3]),
       vec3(m[3][0], m[3][1], m[3][3])
    ];
    var a03 = [
       vec3(m[1][0], m[1][1], m[1][2]),
       vec3(m[2][0], m[2][1], m[2][2]),
       vec3(m[3][0], m[3][1], m[3][2])
    ];
    var a10 = [
       vec3(m[0][1], m[0][2], m[0][3]),
       vec3(m[2][1], m[2][2], m[2][3]),
       vec3(m[3][1], m[3][2], m[3][3])
    ];
    var a11 = [
       vec3(m[0][0], m[0][2], m[0][3]),
       vec3(m[2][0], m[2][2], m[2][3]),
       vec3(m[3][0], m[3][2], m[3][3])
    ];
    var a12 = [
       vec3(m[0][0], m[0][1], m[0][3]),
       vec3(m[2][0], m[2][1], m[2][3]),
       vec3(m[3][0], m[3][1], m[3][3])
    ];
    var a13 = [
       vec3(m[0][0], m[0][1], m[0][2]),
       vec3(m[2][0], m[2][1], m[2][2]),
       vec3(m[3][0], m[3][1], m[3][2])
    ];
    var a20 = [
       vec3(m[0][1], m[0][2], m[0][3]),
       vec3(m[1][1], m[1][2], m[1][3]),
       vec3(m[3][1], m[3][2], m[3][3])
    ];
    var a21 = [
       vec3(m[0][0], m[0][2], m[0][3]),
       vec3(m[1][0], m[1][2], m[1][3]),
       vec3(m[3][0], m[3][2], m[3][3])
    ];
    var a22 = [
       vec3(m[0][0], m[0][1], m[0][3]),
       vec3(m[1][0], m[1][1], m[1][3]),
       vec3(m[3][0], m[3][1], m[3][3])
    ];
    var a23 = [
       vec3(m[0][0], m[0][1], m[0][2]),
       vec3(m[1][0], m[1][1], m[1][2]),
       vec3(m[3][0], m[3][1], m[3][2])
    ];

    var a30 = [
       vec3(m[0][1], m[0][2], m[0][3]),
       vec3(m[1][1], m[1][2], m[1][3]),
       vec3(m[2][1], m[2][2], m[2][3])
    ];
    var a31 = [
       vec3(m[0][0], m[0][2], m[0][3]),
       vec3(m[1][0], m[1][2], m[1][3]),
       vec3(m[2][0], m[2][2], m[2][3])
    ];
    var a32 = [
       vec3(m[0][0], m[0][1], m[0][3]),
       vec3(m[1][0], m[1][1], m[1][3]),
       vec3(m[2][0], m[2][1], m[2][3])
    ];
    var a33 = [
       vec3(m[0][0], m[0][1], m[0][2]),
       vec3(m[1][0], m[1][1], m[1][2]),
       vec3(m[2][0], m[2][1], m[2][2])
    ];



   a[0][0] = det3(a00)/d;
   a[0][1] = -det3(a10)/d;
   a[0][2] = det3(a20)/d;
   a[0][3] = -det3(a30)/d;
   a[1][0] = -det3(a01)/d;
   a[1][1] = det3(a11)/d;
   a[1][2] = -det3(a21)/d;
   a[1][3] = det3(a31)/d;
   a[2][0] = det3(a02)/d;
   a[2][1] = -det3(a12)/d;
   a[2][2] = det3(a22)/d;
   a[2][3] = -det3(a32)/d;
   a[3][0] = -det3(a03)/d;
   a[3][1] = det3(a13)/d;
   a[3][2] = -det3(a23)/d;
   a[3][3] = det3(a33)/d;

   return a;
}
export function inverse(m)
{
   if(m.matrix != true) console.log("not a matrix");
   if(m.length == 2) return inverse2(m);
   if(m.length == 3) return inverse3(m);
   if(m.length == 4) return inverse4(m);
}

export function normalMatrix(m, flag)
{
    var a = mat4();
    a = inverse(transpose(m));
    if(flag != true) return a;
    else {
    var b = mat3();
    for(var i=0;i<3;i++) for(var j=0; j<3; j++) b[i][j] = a[i][j];
    return b;
    }

}
