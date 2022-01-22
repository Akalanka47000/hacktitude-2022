exports.seed = function (knex) {
  return knex("courses")
    .del()
    .then(function () {
      return knex("courses").insert([
        {
          id: 1,
          title: "Javascript",
          level: "Beginner",
          description:
            "JavaScript is a dynamic computer programming language. JavaScript made its first appearance in Netscape 2.0 in 1995 with the name LiveScript. It is lightweight and most commonly used as a part of web pages, whose implementations allow client-side script to interact with the user and make dynamic pages. It is an interpreted programming language with object-oriented capabilities.",
          price: 15
        },
        {
          id: 2,
          title: "DotNET Basics",
          level: "Beginner",
          description:
            ".NET is a free, cross-platform, open source developer platform for building many different types of applications.With .NET, you can use multiple languages, editors, and libraries to build for web, mobile, desktop, games, and IoT.",
          price: 10
        },
        {
          id: 3,
          title: "OOP Concepts",
          level: "Intermediate",
          description:
            "Object-oriented programming (OOP) is a programming paradigm based on the concept of objects, which can contain data and code: data in the form of fields (often known as attributes or properties), and code, in the form of procedures (often known as methods). This will have everything about the course for people to read and get to know more about the courses that they would like to follow.The main ideas behind Java’s Object-Oriented Programming, OOP concepts include abstraction, encapsulation, inheritance and polymorphism.",
          price: 20
        },
        {
          id: 4,
          title: "AWS Lambda",
          level: "Advanced",
          description:
            "AWS Lambda is a serverless compute service that runs your code in response to events and automatically manages the underlying compute resources for you. ..You can use AWS Lambda to extend other AWS services with custom logic, or create your own backend services that operate at AWS scale, performance, and security.",
          price: 8
        },
        {
          id: 5,
          title: "NodeJS",
          level: "Intermediate",
          description:
            "Node. js (Node) is an open source development platform for executing JavaScript code server-side. Node is useful for developing applications that require a persistent connection from the browser to the server and is often used for real-time applications such as chat, news feeds and web push notifications.",
          price: 12
        },
        {
          id: 6,
          title: "MongoDB",
          level: "Beginner",
          description:
            "MongoDB is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas. MongoDB is developed by MongoDB Inc. and licensed under the Server Side Public License.",
          price: 18
        },
      ]);
    });
};

//This table has information about course. 'course id' which is 'id' is the primary key.

// id -> PRIMARY KEY
// title -> Title of the course
// level -> Difficulty level of the course
// description -> Description of the course
// price -> Price of the course in USD