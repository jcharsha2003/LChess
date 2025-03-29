const verifytoken = require("./middlewares/verifyToken");
const exp = require("express");
const nodemailer = require("nodemailer");
const batchapp = exp.Router();
const expressAsyncHandler = require("express-async-handler");






// Send each article as a separate message via Twilio.
const article = '\nYou Got Job.';





batchapp.get(
  "/get-job/:role",
  expressAsyncHandler(async (request, response) => {
    // get jobCollection
    const jobCollection = request.app.get("jobCollection");
    const search = request.query.search ;
    let jobObj = await jobCollection
      .find({ role: request.params.role ,organisation: { $regex: search, $options: "i" } })
      .toArray();

    response.status(200).send({ message: "job list", payload: jobObj });
  })
);

batchapp.get("/get-jobs/:role", expressAsyncHandler( async (req, res) => {
	try {
		const page = parseInt(req.query.page) - 1 || 0;

		const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search || "";
		let sort = req.query.sort || "vacancies";
    let cat = req.query.cat || "All";

		const catOptions = [
			"A",
			"B",
			"C",
			"D",
			"E",
			
		];

		cat === "All"
			? (cat = [...catOptions])
			: (cat = req.query.cat.split(","));

		req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);
		

		let sortBy = {};
		if (sort[1]) {
			sortBy[sort[0]] = sort[1];
		} else {
			sortBy[sort[0]] = "asc";
		}


		
		
    const jobCollection = req.app.get("jobCollection");

    
		const jobs = await jobCollection.find({ role: req.params.role,organisation: { $regex: search, $options: "i" },cat: { $in: cat }})
    
    .sort(sortBy)
    .skip(page * limit)
    .limit(limit)
    .toArray();

   
   
      const total = await jobCollection.countDocuments({
        cat: { $in: [...cat] },
        organisation: { $regex: search, $options: "i" },
      });
      const pageCount = Math.ceil(total / 7);

  
		const response = {
      error: false,
			total,
      pageCount,
			page: page + 1,
    cat: catOptions,
			limit,
			jobs,
		};

		res.status(200).json(response);
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: true, message: "Internal Server Error" });
	}
}));

batchapp.use(exp.json());
batchapp.post(
  "/add-public",
  expressAsyncHandler(async (request, response) => {
    
    const jobCollection = request.app.get("jobCollection");

    const newJob = request.body;

    const jobOfDB = await jobCollection.findOne({ img: newJob.img });
    if (jobOfDB !== null) {
      response.status(200).send({ message: "job already exists" });
    } else {
      const userCollection=request.app.get("userCollection");
      const to = await userCollection.find({ role: "employee" }).toArray();

      const content = `Hey ${newJob.name},\n\nA new job opportunity is available:\n\nOrganization: ${newJob.organisation}\nPost: ${newJob.post}\nCategory: ${newJob.cat}\nLast Date: ${newJob.lastDate}\nVacancies: ${newJob.vacancies}\nApplication Link: ${newJob.link}\n\nFasten your seat belt and grab the job!\n`;
      for (key of to) {
  //       client.messages
  // .create({
  //   body: article,
  //   from: virtualTwilioNumber,
  //   to: `+91${key.phone}`
  // })
  // .then(message => console.log('Message sent:', message.sid))
  // .catch(error => console.error('Error sending message:', error));
         
        sendEmail(key.email,content );
       
      }
      console.log("job created successfully in api")
     
      await jobCollection.insertOne(newJob);
      

      response.status(201).send({ message: "job created" });
    }
  })
);


const sendSMS = async () => {
  try {
    const response = await axios.post('http://localhost:3001/send-sms', {
      message: 'You Got the Job!',
      to: '+919247203883',
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};



batchapp.use(exp.json());
batchapp.post(
  "/add-private",
  expressAsyncHandler(async (request, response) => {
    
    const jobCollection = request.app.get("jobCollection");

    const newJob = request.body;

    const jobOfDB = await jobCollection.findOne({position: newJob.position });
    if (jobOfDB !== null) {
      response.status(200).send({ message: "job already exists" });
    } else {
      const userCollection=request.app.get("userCollection");
      const to = await userCollection.find({ role: "employee" }).toArray();

      const content = `Hey ${newJob.name},\n\nA new job opportunity is available:\n\nOrganization: ${newJob.companyName}\nPost: ${newJob.position}\nJob Type: ${newJob.jobType}\nLocation: ${newJob.location}\nApplication Link: ${newJob.link}\n\nFasten your seat belt and grab the job!\n`;
      for (key of to) {
  //       client.messages
  // .create({
  //   body: article,
  //   from: virtualTwilioNumber,
  //   to: `+91${key.phone}`
  // })
  // .then(message => console.log('Message sent:', message.sid))
  // .catch(error => console.error('Error sending message:', error));
         
        sendEmail(key.email,content );
        sendSMS();
       
      }
     
      console.log("job created successfully in api")
     
      await jobCollection.insertOne(newJob);

      response.status(201).send({ message: "job created" });
    }
  })
);





async function sendEmail(to, content) {
  // Create a SMTP transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.MY_EMAIL}`,
      pass: `${process.env.MY_PASSWORD}`,
    },
  });

  // Define email options
  let mailOptions = {
    from: "yunoastha3@gmail.com",
    to: to,
    subject: "new job available , please do apply",
    text: content,
  };

  // Send the email
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

// Example usage

// pagination sorting
batchapp.put(
  "/update-jobs",

  expressAsyncHandler(async (request, response) => {
    const jobCollection = request.app.get("jobCollection");
  
    await jobCollection.updateMany(
      { vacancies: { $type: "string" } }, // Query to find documents with the "vacancies" field as string
      [
         {
            $set: {
               vacancies: { $toInt: "$vacancies" } // Convert string to integer
            }
         }
      ]
   );


  await jobCollection.updateMany(
    { }, // Update all documents
    [
      {
        $set: {
          cat: { $cond: { if: { $eq: [{ $strLenCP: "$cat" }, 1] }, then: ["$cat"], else: { $split: ["$cat", ", "] } } }
        }
      }
    ]
  )
    response
      .status(200)
      .send({ message: "jobs vacancies type has been updated successfully" });
  })
);


module.exports = batchapp;
