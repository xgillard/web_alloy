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

import static edu.mit.csail.sdg.alloy4web.Config.Key.DELETE;
import static edu.mit.csail.sdg.alloy4web.Config.Key.INPUT;
import static edu.mit.csail.sdg.alloy4web.Config.Key.SOLVER;

import java.io.File;

import edu.mit.csail.sdg.alloy4.Err;
import edu.mit.csail.sdg.alloy4.ErrorWarning;
import edu.mit.csail.sdg.alloy4compiler.parser.CompModule;
import edu.mit.csail.sdg.alloy4compiler.parser.CompUtil;
import edu.mit.csail.sdg.alloy4compiler.translator.A4Options;
import edu.mit.csail.sdg.alloy4compiler.translator.TranslateAlloyToKodkod;

/**
 * This is the main entry point for the Alloy 4 Command Line Interface component.
 * This component is responsible for the solving of instances for the models given by the user.
 * The output of this tool is written on stdout and is formatted according to the JSON format 
 * defined in the ReporterResult class.
 *
 * For more information about the accepted command line arguments and their meaning, please refer
 * to the Config class documentation. 
 *
 * For more information about the output JSON format, please refer to  the ReporterResult class 
 * documentation.
 *
 * NOTE: The JSON format was chosen iso XML because, even though XML can be easily parsed in the frontend too, 
 *       The document produced by Alloy API isn't always 'well formed' (ie, some characters should be escaped to &lt;)
 *       when the solver fails to find an instance.
 *       So, in order to be able to parse the result and correctly show the errors and warnings, in the frontend even 
 *       when the xml document is not well formed, we have opted for JSON which is much less regarding with that respect.
 */
public class A4CLI {
    /**
     * This is the main entry point of the program.
     * @param args the command line argument.
     */
    public static void main(String[] args){
        Config config = Config.parse(args);
        try {
        	System.out.println(solve(config));
        } catch (IllegalStateException ise){
            System.err.println(ise.getLocalizedMessage());
        } finally {
            if(config.<Boolean>get(DELETE)){
                new File(config.<String>get(INPUT)).delete();
            }
        }
    }
    /**
     * This method takes care of everything needed to solve an instance given some input configuration (incl. model).
     * Namely, it calls the Alloy4 API (see CompUtil and TranslateAlloyToKodkod documentation) and registers an instance
     * of ReporterResult to collect the result information.
     * This ReporterResult is then returned and is able to produce the output json text you want to communicate with the
     * user.
     * @param conf the configuration to solve (contains ie, the necessary info about the model to be solved)
     * @return an instance of ReporterResult that is ready to output its result information aggregated in JSON format.
     */
    private static ReporterResult solve(Config conf) {
    	ReporterResult result = new ReporterResult();
        A4Options  options  = new A4Options();
        options.solver      = conf.<A4Options.SatSolver>get(SOLVER);
        // TODO: maybe add skolem depth to the config too
        
		try {
			CompModule module = CompUtil.parseEverything_fromFile(result, null, conf.<String>get(INPUT));
	        if(module.getAllCommands().size()<1) {
	            result.error(new ErrorWarning("There is no command to execute"));
	            return result;
	        }
	        TranslateAlloyToKodkod.execute_command(
	                                        result,
	                                        module.getAllReachableSigs(),
	                                        module.getAllCommands().get(0),
	                                        options);
		} catch (Err e) {
			result.error(e);
		}
        return result;
    }

}
