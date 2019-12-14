

// use process.env variables to keep private variables,
require('dotenv').config()
const orders_table = 'partreports'
const Pool = require('pg').Pool
const pg_format = require('pg-format')
const auth = require('basic-auth')

const pool = new Pool({
    user: 'ross',
    host: '35.227.67.150',
    database: 'invdb',
    password: 'Rossalan94!',
    port: 5432
})

const testConnection = (request, response) => {
    console.log("TESTING_CONNECTION")
    var query = `SELECT 't' as t`
    
    pool.query(query, (error, results) => {
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            console.log(results.rows);
            response.status(200).json(results.rows);
        }
    })
}

/*
const getReports = (request, response) => {
    console.log(request.url);
    pool.query(`SELECT * FROM ${orders_table}`, (error, results) => {
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            response.status(200).json(results.rows);
        }
    });
}

const getReportByOrderId = (request, response) => {
    console.log(request.url);
    const order_id = parseInt(request.params.id);
    var q = pool.query(`SELECT * FROM ${orders_table} WHERE order_id = $1`, [id], (error,results) =>{
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            response.status(200).json(results.rows);
        }
    });
}

const postReport = (request, response) => {
    console.log("CREATE_REPORT");
    console.log(request.body);
    var items = request.body
    
    var values = []
    if(!items.length)
    {
        console.log('Assuming one item')
        items = [request.body]
    }
    
    for(i = 0; i < items.length; i++)
    {
        var item = items[i];
        values.push([
            item.order_id,
            item.order_name,
            item.on_or_off,
            item.switch_status,
            item.radio_selection,
            item.spinner_selection
        ]);
    }

    var query = `
                INSERT INTO ${orders_table} 
                (order_id, order_name, on_or_off, switch_status, radio_selection, spinner_selection)
                VALUES
                %L
                RETURNING *`;

    const query2 = pg_format(query, values)
    console.log(query2);

    pool.query(query2, (error, results) => {
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            response.status(201).json(results.rows);
        }
    })
}*/

const putReport = (request, response) => {
    console.log('PUT_REPORT');
    console.log(request.body);

    var query = `UPDATE ${orders_table} 
                    SET order_id = $2,
                        order_name = $3,
                        on_or_off = $4,
                        switch_status = $5,
                        radio_selection = $6,
                        spinner_selection = $7
                WHERE id = $1
                RETURNING *`;

    const b = request.body;
    const args = [b.id, b.order_id, b.order_name, b.on_or_off, b.switch_status, b.radio_selection, b.spinner_selection];

    pool.query(query, args, (error, results) =>{
        if(error){
            console.error(error)
            response.status(400).json(error)
        }
        else{
            response.json(results.rows)
        }
    })
}

/*
const deleteReport = (request, response) => {
    console.log("DELETE_REPORT");
    console.log(request.body);
    const id = parseInt(request.body.id);

    var query = `DELETE FROM ${orders_table}
                 WHERE id = $1`
    pool.query(query, [id], (error, results) => {
        if(error){
            console.error(err);
            response.status(400).json({dbError: 'failed delete'})
        }
        else{
            response.json({delete: 'true'})
        }
    })
}
*/


const postReportsApp = (request, response) => {
    console.log("CREATE_REPORT_APP");
    console.log(request.body);
    console.log(request.headers);
    var items = request.body
    
    var values = []
    var ids = []
    if(!items.length)
    {
        console.log('Assuming one item')
        items = [request.body]
    }
    
    for(i = 0; i < items.length; i++)
    {
        var item = items[i];
        values.push([
            item.order_id,
            item.order_name,
            item.on_or_off,
            item.switch_status,
            item.radio_selection,
            item.spinner_selection,
            item.user_email
        ]);
        ids.push(item.id);
    }

    var query = `
                INSERT INTO ${orders_table} 
                (order_id, order_name, on_or_off, switch_status, radio_selection, spinner_selection, user_email)
                VALUES
                %L
                RETURNING *`;

    const query2 = pg_format(query, values)

    pool.query(query2, (error, results) => {
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            response.status(201).json(ids);
        }
    })
}

const getReports = (request, response) => {
    console.log(request.body);
    const email = request.body.email || '';
    const date  = request.body.date  || '';
    
    params = {
        "email":email,
        "date":date
    }

    pool.query(`SELECT * FROM func_get_partreports_by_email($1)`,[email], (error, results) => {
        if(error){
            console.error(error);
            response.status(500).json(error);
        }
        else
        {
            response.status(200).json(results.rows);
        }
    });
}

const validateUser = (request, response, next) => {
    /*
        Retrieves a user from the postgresql server
        returns a has of the form {'user_email':email, 'user_password':password}
        if the user does not exist it will return a hash with empty strings for the user and password
    */
    console.log("VALIDATING_USER");
    
    const user_req = auth.parse(request.header('authorization'));
    console.log(user_req);

    if(!user_req)
    {
        response.status(401).send('No authoriazation header');
    }
    else
    {
        pool.query(`SELECT * FROM users WHERE user_email = $1`,[user_req.name], (error, results) =>
        {
            const user = {user_email:'', user_password:''}
            if(error)
            {
                console.error(error);
                response.status(500).json(error).send();
            }
            else if(results.rowCount == 0)
            {
                response.status(401).send('User does not exist in database');
            }
            else if(results.rowCount == 1)
            {
                user_row = results.rows[0];
                let user_email = user_row.user_email;
                let user_password = user_row.user_password;
                if(user_email != user_req.name)
                {
                    response.status(401).send('User does not match');
                }
                else if(user_password != user_req.pass)
                {
                    //Request is good send it on
                    response.status(401).send('Invalid password');
                }
                else
                {
                    next();
                }
                console.log(user.user_password);
            }
            else
            {
                response.status(409).send('Multiple users found')
            }
        });
    }
}


module.exports = {
    postReportsApp,
    testConnection,
    getReports,
    validateUser
}

/*
module.exports = {
    getReports,
    getReportByOrderId,
    postReport,
    postReportApp,
    putReport,
    deleteReport
}
*/