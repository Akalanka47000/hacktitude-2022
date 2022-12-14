const express = require("express");
const router = express.Router();
const courseService = require("../services/courseService");
const googleBookService = require("../services/googleBookService");
const openExchangeRatesService = require("../services/openExchangeRatesService");

router.get("/allcourses", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const courses = await courseService.allCourses(userId);
  res.render(
    "all-courses.ejs",
    { allcourses: courses, userId: userId },
    (error, ejs) => {
      if (error) {
        console.log(error);
        res.render("error.ejs", { message: "EJS" });
      } else {
        res.send(ejs);
      }
    }
  );
});

router.get("/enrolled", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const userCourses = await courseService.userCourses(userId);
  res.render(
    "enrolled.ejs",
    { courses: userCourses, userId: userId },
    (error, ejs) => {
      if (error) {
        console.log(error);
        res.render("error.ejs", { message: "EJS" });
      } else {
        res.send(ejs);
      }
    }
  );
});

router.post("/search", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const searchVal = req.body.searchVal;
  courseService
    .searchedCourses(userId, searchVal)
    .then((data) => {
      res.render(
        "all-courses.ejs",
        { allcourses: data, userId: userId },
        (error, ejs) => {
          if (error) {
            console.log(error);
            res.render("error.ejs", { message: "EJS" });
          } else {
            res.send(ejs);
          }
        }
      );
    })
    .catch((error) => {
      console.log(error);
      res.render("error.ejs", { message: "Server" });
    });
});

router.get("/sort", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const criteria = req.query.criteria;
  if (!criteria || criteria.indexOf("_") < 0) {
    res.render("error.ejs", {
      message: "Sort criteria must be available and should contain '_' in it",
    });
  } else {
    console.log(criteria);
    const action = criteria.split("_")[0];
    const value = criteria.split("_")[1];
    const sortedCourses = await courseService.sortedCourses(action, value);
    res.render(
      "all-courses.ejs",
      { allcourses: sortedCourses, userId: userId },
      (error, ejs) => {
        if (error) {
          console.log(error);
          res.render("error.ejs", { message: "EJS" });
        } else {
          res.send(ejs);
        }
      }
    );
  }
});

router.get("/dashboard", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const courseId = req.query.courseId;
  const courseDetails = await courseService.courseDetails(userId, courseId);
  const books = await googleBookService.getBooksByTitle(courseDetails.course.title);
  const currencyVal = await openExchangeRatesService.openExchangeRates(courseDetails.course.price, "USD", courseDetails.to );
  console.log(courseDetails.to);
  res.render(
    "course-dashboard.ejs",
    {
      title: courseDetails.course.title,
      level: courseDetails.course.level,
      description: courseDetails.course.description,
      id: courseDetails.course.id,
      back: "req.query.paramB",
      enrolled: courseDetails.enrolled,
      books: books,
      price: currencyVal.toFixed(2),
      currency_code: courseDetails.to,
      duration: courseDetails.course.duration,
      ecount: courseDetails.ecount,
      reviews: courseDetails.reviews,
    },
    (error, ejs) => {
      if (error) {
        console.log(error);
        res.render("error.ejs", { message: "EJS" });
      } else {
        res.send(ejs);
      }
    }
  );
});

router.get("/enroll", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const courseId = req.query.courseId;
  await courseService.courseEnroll(userId, courseId);
  const userCourses = await courseService.userCourses(userId);
  res.render(
    "enrolled.ejs",
    { courses: userCourses, userId: userId },
    (error, ejs) => {
      if (error) {
        console.log(error);
        res.render("error.ejs", { message: "EJS" });
      } else {
        res.send(ejs);
      }
    }
  );
});

router.get("/disenroll", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const courseId = req.query.courseId;
  await courseService.courseDisenroll(userId, courseId);
  res.redirect(`/course/dashboard?courseId=${courseId}`);
});

router.get("/coursePage", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const courseId = req.query.courseId;
  await courseService.resumeLearning(courseId, userId);
  const courseContent = await courseService.courseContentDetails(courseId);
  res.render(
    "course-page.ejs",
    {
      chapters: courseContent.chapters,
      title: courseContent.course.title,
      level: courseContent.course.level,
      description: courseContent.course.description,
      id: courseContent.course.id,
      back: "req.query.paramB",
    },
    (error, ejs) => {
      if (error) {
        console.log(error);
        res.render("error.ejs", { message: "EJS" });
      } else {
        res.send(ejs);
      }
    }
  );
});

router.get("/reset", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  await courseService.resetCourses(userId);
  const userCourses = await courseService.userCourses(userId);
  res.render(
    "enrolled.ejs",
    { courses: userCourses, userId: userId },
    (error, ejs) => {
      if (error) {
        console.log(error);
        res.render("error.ejs", { message: "EJS" });
      } else {
        res.send(ejs);
      }
    }
  );
});

router.get("/mcq/:id", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const courseId = req.params.id;
  const courseMcq = await courseService.courseMcq(courseId);
  res.render(
    "mcq.ejs",
    { que: courseMcq.questions, answer: courseMcq.answers, id: courseId },
    (error, ejs) => {
      if (error) {
        console.log(error);
        res.render("error.ejs", { message: "EJS" });
      } else {
        res.send(ejs);
      }
    }
  );
});

router.post("/scores/:id", async (req, res) => {
  const courseId = req.params.id;
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const ans1 = req.body.q0_answer;
  const ans2 = req.body.q1_answer;
  const ans3 = req.body.q2_answer;
  const courseScore = await courseService.courseScore(
    courseId,
    userId,
    ans1,
    ans2,
    ans3
  );
  const courseAvgScore = await courseService.courseAvgScore(courseId);
  res.render(
    "scores.ejs",
    { score: courseScore, courseAvgScore: courseAvgScore },
    (error, ejs) => {
      if (error) {
        console.log(error);
        res.render("error.ejs", { message: "EJS" });
      } else {
        res.send(ejs);
      }
    }
  );
});

router.post("/review/:cid", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const courseId = req.params.cid;
  const review = req.body.user_review;
  console.log("Review received: " + review);
  console.log("TODO: Review should be stored in the database");
  await courseService.addReview(courseId, userId, review);
  res.redirect(`/course/dashboard?courseId=${courseId}`);
});

router.get("/pin/:cid", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const courseId = req.params.cid;
  //TODO implement the logic
  await courseService.changePin(courseId, userId);

  res.redirect(`/course/dashboard?courseId=${courseId}`);
});

router.get("/updateProgress/:courseId/:progress", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/");
    return;
  }
  const courseId = req.params.courseId;
  const progress = req.params.progress;
  await courseService.updateProgress(courseId, userId, progress);
  res.redirect(`/course/coursePage?courseId=${courseId}`);
});

router.get("/getHacktitudeCourses", async (req, res) => {
  console.log(req.query);
  const getHacktitudeCourses = await courseService.getHacktitudeCourses(
    req.query.maxResults,
    req.query.title
  );
  res.json({ courses: getHacktitudeCourses });
});

module.exports = router;
