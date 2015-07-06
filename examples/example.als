sig Name{}
sig Person{
    name: one Name
}

fact identified_by_name {
    all p,p' : Person | p.name = p'.name => p=p'
}

run {some Person}