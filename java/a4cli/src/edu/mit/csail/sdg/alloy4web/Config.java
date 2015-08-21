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

import edu.mit.csail.sdg.alloy4compiler.translator.A4Options;
import gnu.getopt.Getopt;

import java.io.File;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * This class provides nothing but an easy way to access the configuration that was parsed from the
 * command line arguments.
 *
 * The authorized command line options are the following one: 
 * -i <filename>    The filename to use as starting point to solve the model. (You MUST give at least one such flag)
 *
 * -s <solvername>  The name of the sat solver you want to use to perform the model checking. Authorized values are: 
 *                  berkmin, spear, minisat, minisatprover, zchaff, sat4j, cnf, kodkod.
 *                  If not specified, this option has a default value of 'sat4j'.
 *
 * -d               !! DEPRECATED !!
 *                  Should the input file be deleted after it has been solved.
 *
 * -o               !! NOT IMPLEMENTED !! 
 *                  This option was initially foreseen as a way to provide multiple output formats.
 *                  So far, only JSON format has been implemented and this option has no effect.
 */
public final class Config {
    /**
     * This map contains the String -> Solver mapping that permits us to retrieve the proper solver instance
     * from its name identifier.
     */
    private static final Map<String, A4Options.SatSolver> SOLVER_MAP;

    static {
        HashMap<String, A4Options.SatSolver> solvers = new HashMap<String, A4Options.SatSolver>();
        solvers.put("berkmin",       A4Options.SatSolver.BerkMinPIPE);
        solvers.put("spear",         A4Options.SatSolver.SpearPIPE);
        solvers.put("minisat",       A4Options.SatSolver.MiniSatJNI);
        solvers.put("minisatprover", A4Options.SatSolver.MiniSatProverJNI);
        solvers.put("zchaff",        A4Options.SatSolver.ZChaffJNI);
        solvers.put("sat4j",         A4Options.SatSolver.SAT4J);
        solvers.put("cnf",           A4Options.SatSolver.CNF);
        solvers.put("kodkod",        A4Options.SatSolver.KK);

        SOLVER_MAP = Collections.unmodifiableMap(solvers);
    }

    /** 
     * An enum representing the possible values for the configuration tweaks.
     *
     * INPUT            --> Name of the input module to use
     * DELETE           --> (DEPRECATED) Should I delete the input file after the instance has been solved
     * SOLVER           --> A4Solver instance to use to perform the model checking
     * OUTPUT_FORMAT    --> (NOT IMPLEMENTED) associate behavior with this one if you want to provide an alternative
     *                      to the JSON format
     */
    public enum Key {
        INPUT,
        DELETE,
        SOLVER,
        OUTPUT_FORMAT
    }

    /** This is where we really store the config that's been parsed */
    private final HashMap<Key, Object> conf;

    /**
     * You're not allowed to create this object yourself.
     * You should use the factory methods instead
     */
    private Config(){
        conf = new HashMap<Key, Object>();
        // Put any defaults you want here
        conf.put(Key.DELETE, Boolean.FALSE);
        conf.put(Key.SOLVER, A4Options.SatSolver.SAT4J);
    }

    /**
     * Returns the value associated with key in the configuration
     * @param key the key to lookup
     * @param <T> the type of the output value
     * @return the value associated with key in the configuration
     */
    @SuppressWarnings("unchecked")
    public <T> T get(Key key) {
        return (T) conf.get(key);
    }

    /**
     * Factory method to parse the command-line arguments
     * @param args the command-line arguments to parse
     * @return a config instance representing the configuration passed on via cmd line.
     */
    public static Config parse(String[]args) {
        Config c = new Config();
        Getopt g = new Getopt("a4cli", args, "i:ds:o:");

        int opt;
        while ((opt = g.getopt()) != -1) {
            switch (opt) {
                case 'i': // input
                    c.conf.put(Key.INPUT, g.getOptarg());
                    break;
                case 'd':
                    c.conf.put(Key.DELETE, Boolean.TRUE);
                    break;
                case 's':
                    c.conf.put(Key.SOLVER, SOLVER_MAP.get(g.getOptarg().toLowerCase()));
                    break;
                case 'o':
                    // TODO
                    break;
            }
        }
        if(c.get(Key.INPUT) == null){
            throw new IllegalStateException("You should have specified AT LEAST an input file");
        }
        return c;
    }
}
