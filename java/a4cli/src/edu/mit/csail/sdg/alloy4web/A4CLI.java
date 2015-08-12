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
 * Command Line Interface for alloy 4
 */
public class A4CLI {

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
