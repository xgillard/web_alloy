package edu.mit.csail.sdg.alloy4web;

import edu.mit.csail.sdg.alloy4compiler.translator.A4Options;
import gnu.getopt.Getopt;

import java.io.File;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Nothing but an easy way to access the configuration that was parsed from the
 * command line arguments.
 */
public final class Config {
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

    /** an enum representing the possible values for the configuration tweaks */
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
