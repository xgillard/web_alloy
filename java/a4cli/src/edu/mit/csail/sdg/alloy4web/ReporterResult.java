package edu.mit.csail.sdg.alloy4web;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

import edu.mit.csail.sdg.alloy4.A4Reporter;
import edu.mit.csail.sdg.alloy4.Err;
import edu.mit.csail.sdg.alloy4.ErrorWarning;
import edu.mit.csail.sdg.alloy4.Pos;
import edu.mit.csail.sdg.alloy4compiler.translator.A4Solution;

public class ReporterResult extends A4Reporter {
  
  private String    instance = null;
  private boolean   isSat    = false;  
  private boolean   isUnsat  = false;
  private List<Err> warnings = new ArrayList<Err>();
  private List<Err> errors   = new ArrayList<Err>();
	
  @Override
  public void warning(ErrorWarning msg){
	 warnings.add(msg);
  }
  
  public void error(Err msg){
	 errors.add(msg);
  }
  
  @Override
  public void resultSAT(Object cmd, long time, Object sln){
	  isSat = true;
	  handleSolution(sln);
  }
  
  @Override
  public void resultUNSAT(Object cmd, long time, Object sln){
	  isUnsat = true;
	  handleSolution(sln);
  }
  
  @Override
  public String toString(){
	  StringBuilder sb = new StringBuilder();
	  encodeAsJson(sb);
	  return sb.toString();
  }
  
  private void encodeAsJson(StringBuilder out){
	  out.append("{").append("")
	     .append("\"isSat\"   : ").append(isSat).append(",")
	     .append("\"isUnsat\" : ").append(isUnsat).append(",")
	     .append("\"isWarn\"  : ").append(!warnings.isEmpty()).append(",")
	     .append("\"isError\" : ").append(!errors.isEmpty()).append(",")
	     ;
	  if(instance != null){
		  out.append("\"instance\": \"").append(jsonSafe(instance, false)).append("\" ,");
	  }
	  out.append("\"warnings\": [ ");
	  for(int i = 0; i<warnings.size(); i++){
		  encodeErrorAsJson(out, warnings.get(i));
		  if(i+1<warnings.size()){
			  out.append(",");
		  }
      }
	  out.append("], ");
	  out.append("\"errors\": [ ");
	  for(int i = 0; i<errors.size(); i++){
		  encodeErrorAsJson(out, errors.get(i));
		  if(i+1<errors.size()){
			  out.append(",");
		  }
      }
	  out.append("]");
	  out.append("}");
  }
  
  private void encodeErrorAsJson(StringBuilder out, Err e){
	  out.append("{ ");
	  out.append("\"pos\" : "); encodePosAsJson(out, e.pos); out.append(", ");
	  out.append("\"msg\" : \"").append(jsonSafe(e.msg, true)); out.append("\"");
	  out.append("}");
  }   
  private void encodePosAsJson(StringBuilder out, Pos p){
	  String format = "{\"start_col\": %d, \"start_row\": %d, \"end_col\": %d, \"end_row\": %d }";
	  out.append(String.format(format, p.x, p.y, p.x2, p.y2));
  }
  
  private void handleSolution(Object sln){
	  // Sorry about that, it's ugly but it's the only way: A4Reporter declares sln to be 
	  // of type object. so it's the only way to override this method
	  A4Solution solution = (A4Solution) sln;
	  
	  StringWriter sw = new StringWriter();
	  PrintWriter  pw = new PrintWriter(sw);
	  
	  try {
		solution.writeXML(pw, null, null);
		instance = sw.toString();
  	  } catch (Err e) {
		errors.add(e);
	  } finally {
		pw.close();
		try { sw.close(); } catch(IOException t){/* I don't care */}
	  }
  }
  
  private String jsonSafe(String s, boolean keepNewLines){
	  String r =  s.replaceAll("\n", keepNewLines ? "\\\\n" : "")
			  	   .replaceAll("\"", "'");
	  return r;
  }
  
}
