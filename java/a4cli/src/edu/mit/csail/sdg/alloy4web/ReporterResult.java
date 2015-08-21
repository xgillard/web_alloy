/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Xavier Gillard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package edu.mit.csail.sdg.alloy4web;

import java.io.File;
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

/**
 * This class implements an object that collects the results provided by the Alloy4 API
 * and is able to serve them in JSON format.
 *
 * It does so by extending the A4Report class (see A4 api documentation for more info).
 * The output JSON format looks like this: 
 *
 * {
 *	"isSat"   : boolean,  		// Set to true when the solver says SAT
 *  "isUnsat" : boolean,  		// Set to true when the solver says UNSAT
 *  "isWarn"  : boolean,  		// Set to true when the compiler detects some warning in the model.
 *						  		// Check the warnings field for the details about the warning reported
 *  "isError" : boolean,  		// Set to true when the compiler reports and error or whenever an other
 *						  		// error is detected. Check the errors field for the details of the 
 *						  		// reported errors.
 *  "instance": String,	  		// Contains a String encapsulating an XML document representing the instance 
 *						  		// found by the SAT solver. The XML text itself was not really documented but
 *						  		// is fairly easy to understand if you're comfortable with the Alloy concepts.
 *	"warnings": [],		  		// Contains an array of 'error objects' (the structure is the same for both errors
 *						  		// and warnings).
 *  "errors"  : [		  		// Contains an array of 'error objects'. Each such object has the following structure:
 *    {
 *		"pos" : {		  		// The position of where the problem happened. (So far only module and start_row are used)
 *			"module"   : String,// The name of the module where the problem happened
 *			"start_row": Int, 	// The row (line number starting at 1) where the problem was detected to start
 *			"start_col": Int,	// The column where the problem was detected to start (starts at 1)
 *			"end_row"  : Int, 	// The row (line number starting at 1) where the problem is supposed to end.
 *			"end_col"  : Int 	// The column (offset in the line starting at 1) where the problem is supposed to end
 *	    },	
 *      "msg" : String 	  // The text of the error message
 *    }
 *  ]
 * }
 * 
 * NOTE: If you are about to implement multiple output formats (the -o option on the command line), you might want to
 * 	     split this class in two: the Reporter that gather the results and some Presenter that formats them in the 
 *       appropriate output format. This should be fairly easy to do: just take all the methods from 'encodeAsJson'
 *       to the bottom of the class and put them in the Presenter class of your own.
 */
public class ReporterResult extends A4Reporter {
  /** This field stores the instance reported by the A4 api as a string encoded xml document */
  private String    instance = null;
  /** This flag is turned on whenever the solver tells us that the instance was satisfiable */
  private boolean   isSat    = false;  
  /** This flag is turned on whenever the solver tells us that the instance was NOT satisfiable */
  private boolean   isUnsat  = false;
  /** This list gathers all the warnings that have been reported by the A4 api when processing the model */
  private List<Err> warnings = new ArrayList<Err>();
  /** This list gathers all the errors that have been reported by the A4 api when processing the model */
  private List<Err> errors   = new ArrayList<Err>();

  /**
   * This method lets the ReporterResult know that a warning has been reported by the compiler 
   * @param msg the warning to report
   */
  @Override
  public void warning(ErrorWarning msg){
	 warnings.add(msg);
  }
  /**
   * This method lets the ReporterResult know that an error has happened somewhere.
   * @param msg the error to report
   */
  public void error(Err msg){
	 errors.add(msg);
  }
  
  /**
   * This method is called by the A4 API whenever it has found a solution.
   */
  @Override
  public void resultSAT(Object cmd, long time, Object sln){
	  isSat = true;
	  handleSolution(sln);
  }
  /**
   * This method is called by the A4 API whenever it has exhausted all possible cases in the scope and could not
   * find any instance.
   */
  @Override
  public void resultUNSAT(Object cmd, long time, Object sln){
	  isUnsat = true;
	  handleSolution(sln);
  }
  
  /**
   * This method gathers all the results that have been reported and formats them as a JSON string.
   */
  @Override
  public String toString(){
	  StringBuilder sb = new StringBuilder();
	  encodeAsJson(sb);
	  return sb.toString();
  }
  
  /**
   * This method takes care of formatting the gathered results as a JSON encoded object.
   * @param out the StringBuilder to use in order to efficiently write the results.
   */
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
  /**
   * Encodes the given error (or warning) e and appends it to the 'out' stream.
   * @param out the StringBuilder to use in order to efficiently write the results.
   * @param e the error to encode in json format
   */
  private void encodeErrorAsJson(StringBuilder out, Err e){
	  out.append("{ ");
	  out.append("\"pos\" : "); encodePosAsJson(out, e.pos); out.append(", ");
	  out.append("\"msg\" : \"").append(jsonSafe(e.msg, true)); out.append("\"");
	  out.append("}");
  }
  /**
   * Encodes the given error (or warning) position p and appends it to the 'out' stream.
   * @param out the StringBuilder to use in order to efficiently write the results.
   * @param p the position to encode
   */
  private void encodePosAsJson(StringBuilder out, Pos p){
	  String format = "{\"module\": \"%s\", \"start_col\": %d, \"start_row\": %d, \"end_col\": %d, \"end_row\": %d }";
	  out.append(String.format(format, moduleName(p), p.x, p.y, p.x2, p.y2));
  }
  /**
   * Determines the module name based on the filename where that module was written.
   * @return the module name where error at position p occured
   */
  private String moduleName(Pos p){
	if(p==null || p.filename==null || p.filename.matches("\\s*")) return "";
	File f = new File(p.filename);
	return f.getName().split("\\.")[0];
  }
  /**
   * This method encodes the given sln Object as an XML encoded String.
   */
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
  /**
   * This method "sanitizes" the json object produced in string s such as to make sure that a browser will be able
   * to decode it using JSON.parse()
   * @param s the strong containing the json document to sanitize.
   * @param keepNewLines a flag to determine whether or not to keep the new lines in the output document.
   * @return a string that is safe to send to a browser front end.
   */
  private String jsonSafe(String s, boolean keepNewLines){
	  String r =  s.replaceAll("\n", keepNewLines ? "\\\\n" : "")
			  	   .replaceAll("\"", "'");
	  return r;
  }
  
}
