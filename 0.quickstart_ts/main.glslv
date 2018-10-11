precision lowp float;

// xy = vertex position in normalized device coordinates ([-1,+1] range).
attribute vec2 vertexPositionNDC;

varying vec2 vTexCoords;

const vec2 scale = vec2(0.5, 0.5);

void main()
{
    vTexCoords  = vertexPositionNDC * scale + scale; // scale vertex attribute to [0,1] range
    gl_Position = vec4(vertexPositionNDC, 0.0, 1.0);
}
