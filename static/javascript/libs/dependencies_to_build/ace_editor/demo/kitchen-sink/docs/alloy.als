module exo/tree

abstract sig Tree {
	parent   : lone Tree,
	children : set Tree
} {
	@parent = ~@children
	no ^@parent & ^@children
}

one sig Root extends Tree {} {
	no parent
}
sig Node extends Tree {} {
	one parent
	some children
}
sig Leaf extends Tree {} {
	one parent
	no children
}


--fact NoSelfAncestor {
--	no x : Tree-Root | x in x.^parent
--}
--fact NoAncestorKid {
--	all x: Tree-Root | no (x.^parent & x.^children)
--}
--fact ParentTransposeKid {
--	all x,y: Tree | y in x.children => y.parent = x
--	all x,y: Tree | x = y.parent   => y in x.children
--}

run {
	
} for 4
