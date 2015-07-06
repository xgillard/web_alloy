package edu.mit.csail.sdg.alloy4web;

import edu.mit.csail.sdg.alloy4.A4Reporter;
import edu.mit.csail.sdg.alloy4.Err;
import edu.mit.csail.sdg.alloy4compiler.parser.CompModule;
import edu.mit.csail.sdg.alloy4compiler.parser.CompUtil;
import edu.mit.csail.sdg.alloy4compiler.translator.A4Options;
import edu.mit.csail.sdg.alloy4compiler.translator.A4Solution;
import edu.mit.csail.sdg.alloy4compiler.translator.TranslateAlloyToKodkod;

import java.io.File;
import java.io.PrintWriter;

import static edu.mit.csail.sdg.alloy4web.Config.Key.*;

/**
 * Command Line Interface for alloy 4
 */
public class A4CLI {

    public static void main(String[] args){
        Config config = Config.parse(args);
        try {
            solve(config).writeXML(new PrintWriter(System.out), null, null);
        } catch (Err err){
            System.err.println(err.getLocalizedMessage());
        } catch (IllegalStateException ise){
            System.err.println(ise.getLocalizedMessage());
        } finally {
            if(config.<Boolean>get(DELETE)){
                new File(config.<String>get(INPUT)).delete();
            }
        }
    }

    private static A4Solution solve(Config conf) throws Err {
        A4Reporter reporter = new A4Reporter();
        A4Options  options  = new A4Options();
        options.solver      = conf.<A4Options.SatSolver>get(SOLVER);
        // TODO: maybe add skolem depth to the config too

        CompModule module   = CompUtil.parseEverything_fromFile(reporter, null, conf.<String>get(INPUT));

        if(module.getAllCommands().size()<1) {
            throw new IllegalStateException("There are no commands to execute");
        }
        A4Solution solution = TranslateAlloyToKodkod.execute_command(
                                        reporter,
                                        module.getAllReachableSigs(),
                                        module.getAllCommands().get(0),
                                        options);

        return solution;
    }

}
