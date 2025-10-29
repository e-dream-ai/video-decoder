export class WebGLRenderer {
  private gl: WebGL2RenderingContext;

  private static vertexShaderSource = `#version 300 es
      in vec2 xy;
      out highp vec2 uv;
  
      void main(void) {
        gl_Position = vec4(xy, 0.0, 1.0);
        uv = vec2((1.0 + xy.x) / 2.0, (1.0 - xy.y) / 2.0);
      }
    `;

  private static fragmentShaderSource = `#version 300 es
      precision highp float;
      in highp vec2 uv;
      out vec4 fragColor;
      uniform sampler2D uTexture;
  
      void main(void) {
        fragColor = texture(uTexture, uv);
      }
    `;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("WebGL2 not supported");
    }
    this.gl = gl;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) throw new Error("Failed to create vertex shader");
    gl.shaderSource(vertexShader, WebGLRenderer.vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(vertexShader) || "");
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) throw new Error("Failed to create fragment shader");
    gl.shaderSource(fragmentShader, WebGLRenderer.fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(fragmentShader) || "");
    }

    const shaderProgram = gl.createProgram();
    if (!shaderProgram) throw new Error("Failed to create program");
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(shaderProgram) || "");
    }
    gl.useProgram(shaderProgram);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, -1.0, +1.0, +1.0, +1.0, +1.0, -1.0]),
      gl.STATIC_DRAW
    );

    const xyLocation = gl.getAttribLocation(shaderProgram, "xy");
    gl.vertexAttribPointer(xyLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(xyLocation);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  draw(frame: VideoFrame) {
    const gl = this.gl;

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frame);

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }
}
