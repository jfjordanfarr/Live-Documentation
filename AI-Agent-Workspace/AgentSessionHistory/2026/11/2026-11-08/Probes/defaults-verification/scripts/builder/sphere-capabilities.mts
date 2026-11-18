import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { observeGraph } from "../../tests/e2e/force-graph-observation.ts";
const browser=await chromium.launch({headless:true}),page=await browser.newPage();
await page.addInitScript({content:'globalThis.__name=value=>value;'});await observeGraph(page);
try{
  await page.goto('http://localhost:8911/samples/estate/?view=local&mode=3d&layout=structure');
  await page.waitForFunction(()=>Boolean((window as any).renderedGraph));
  const result=await page.evaluate(()=>{
    const gl=(window as any).renderedGraph.renderer.getContext()as WebGL2RenderingContext;
    const variables=gl.getExtension('OES_sample_variables');
    const interpolation=gl.getExtension('OES_shader_multisample_interpolation');
    const attempts=['#version 300 es\nprecision highp float;out vec4 result;void main(){result=vec4(float(gl_SampleID));}',
      '#version 300 es\n#extension GL_OES_sample_variables : require\nprecision highp float;out vec4 result;void main(){result=vec4(float(gl_SampleID));}',
      '#version 300 es\n#extension GL_OES_sample_variables : require\n#extension GL_OES_shader_multisample_interpolation : require\nprecision highp float;in vec3 ray;out vec4 result;void main(){result=vec4(interpolateAtSample(ray,gl_SampleID),1.0);}'].map(source=>{
        const shader=gl.createShader(gl.FRAGMENT_SHADER)!;gl.shaderSource(shader,source);gl.compileShader(shader);
        const result={source,compiled:gl.getShaderParameter(shader,gl.COMPILE_STATUS),log:gl.getShaderInfoLog(shader)};gl.deleteShader(shader);return result;
      });
    const canvas=document.createElement('canvas');canvas.width=canvas.height=4;
    const sample=canvas.getContext('webgl2',{antialias:true})!;
    sample.getExtension('OES_sample_variables');sample.getExtension('OES_shader_multisample_interpolation');
    const program=sample.createProgram()!;
    for(const[type,source]of [[sample.VERTEX_SHADER,'#version 300 es\nprecision highp float;layout(location=0)in vec2 position;out vec2 ray;void main(){ray=position;gl_Position=vec4(position,0,1);}'],
      [sample.FRAGMENT_SHADER,'#version 300 es\n#extension GL_OES_sample_variables : require\n#extension GL_OES_shader_multisample_interpolation : require\nprecision highp float;in vec2 ray;out vec4 result;void main(){vec2 atSample=interpolateAtSample(ray,gl_SampleID);result=vec4(gl_SampleID==0?1.0:0.0,.5+.01*atSample.x,0,1);}']]as const){
      const shader=sample.createShader(type)!;sample.shaderSource(shader,source);sample.compileShader(shader);sample.attachShader(program,shader);sample.deleteShader(shader);
    }
    sample.linkProgram(program);const linked=sample.getProgramParameter(program,sample.LINK_STATUS),linkLog=sample.getProgramInfoLog(program);
    const buffer=sample.createBuffer();sample.bindBuffer(sample.ARRAY_BUFFER,buffer);sample.bufferData(sample.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),sample.STATIC_DRAW);
    sample.enableVertexAttribArray(0);sample.vertexAttribPointer(0,2,sample.FLOAT,false,0,0);sample.useProgram(program);sample.drawArrays(sample.TRIANGLES,0,3);
    const pixel=new Uint8Array(4);sample.readPixels(2,2,1,1,sample.RGBA,sample.UNSIGNED_BYTE,pixel);
    const sampleDraw={samples:sample.getParameter(sample.SAMPLES),linked,linkLog,pixel:[...pixel],expectedOneRedSample:255/4};
    sample.deleteProgram(program);sample.deleteBuffer(buffer);
    return{context:gl.getContextAttributes(),samples:gl.getParameter(gl.SAMPLES),maxSamples:gl.getParameter(gl.MAX_SAMPLES),sampleExtensions:gl.getSupportedExtensions()?.filter(name=>/sample|multisample|interpol/i.test(name)),sampleVariables:!!variables,sampleInterpolation:!!interpolation,sampleShading:!!gl.getExtension('OES_sample_shading'),attempts,sampleDraw};
  });
  await writeFile('/tmp/live-docs-20261108-defaults-diagnostics/sphere-capabilities.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await browser.close();}
