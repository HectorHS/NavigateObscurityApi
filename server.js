const fastify = require('fastify')()
const mysql = require('@fastify/mysql');
const nodemailer = require('nodemailer');
const port = 5000

fastify.register(mysql, {
    connectionString: 'mysql://user:password@localhost/namextlv_navigateobscurityDB'
});

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: "premium60.web-hosting.com",
    port: 465,
    secure: true,
    auth: {
        user: 'admin@navigateobscurity.com',
        pass: ""
    }
});

//   get comments for a page
fastify.get('/comments/:pageid', (req, reply) => {
    const {pageid} = req.params;
    fastify.mysql.getConnection(onConnect)
  
    function onConnect (err, client) {
        if (err) return reply.send(err)

        let query = 'SELECT * FROM main_comment WHERE page_id = ' + pageid;
        client.query(
            query, [req.params.id],
            function onResult (err, result) {
                client.release()
                reply.send(err || result)
            }
        )
    }
})
//   save a new comment
fastify.post('/addComment', (req, reply) => {
    const { author, message, created_date, approved_comment, page_id } = req.body;
    fastify.mysql.getConnection(onConnect)
  
    function onConnect (err, client) {
        if (err) return reply.send(err)

        sendEmail(author, message, page_id)
        let query = "INSERT INTO main_comment (author, message,created_date,approved_comment,page_id) VALUES ('" + author + "','" + message + "','" + created_date + "'," + +approved_comment + "," + +page_id + ")";
        client.query(
            query,
            function onResult (err, result) {
                client.release()
                reply.send(err || result)
            }
        )
    }
})

async function sendEmail(author, message, page_id) {
    const mailOptions = {
        from: 'Admin <admin@navigateobscurity.com>', 
        to: 'hector.hurmuz@gmail.com', 
        subject: "Navigate Obscurity - New comment",
        text: "new comment notification",
        html: "<div>A new comment wa posted by " + author + " on page with id " + page_id + ".</div></br></br><div>" + message + "</div>"
    };
    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: ", info);
        }
        if (resolve) {
            resolve(true);
        }
    });
}

const start = async () => {
    try {
        await fastify.listen(port)
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
    }
}

start()