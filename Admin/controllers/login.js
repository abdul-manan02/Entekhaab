const login = async (req, res) => {
    try {
        const {username, password} = req.body;
        if(username === 'admin' && password === 'admin'){
            res.status(201).json({msg: 'success'})
        }else{
            res.status(401).json({msg: 'failure'})
        }
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

export{
    login
}