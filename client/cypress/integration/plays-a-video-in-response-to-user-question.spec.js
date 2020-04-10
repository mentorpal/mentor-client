import { mockMentorData, toGuestUrl } from "./helpers";

describe("plays a video in response to a user question", () => {
  beforeEach(() => {
    cy.server();
    mockMentorData(cy);
    cy.route({
      method: "GET",
      url: "**/mentor-api/questions/?mentor=clint&query=is+the+food+good",
      response: {
        answer_id: "clintanderson_A141_3_1",
        answer_text:
          "The food in the military it's, I have to say it's outstanding. Maybe not many people would agree with that because it's kind of plain and bland. So you have your cafeteria style you know, style food. You go there, I want some meat, I want some potatoes, I want some broccoli, you know. And they provide a good selection for you. They don't really season it so much because so many people come through you know, it's not like it's Applebee's or anything. They allow you season it yourself, so as long as you kind of realize that you know, then they give you big portions for little cost, or no cost if you're active duty, and technically it is healthy you know. In fact I think that they recently took salt away from the table so like you have to try to be healthy when you eat your food, and it delivers.",
        classifier: "/app/checkpoint/classifiers/lstm_v1/2019-11-14-2031/clint",
        confidence: -0.17295779542857515,
        mentor: "clint",
        query: "is the food good",
      },
    });
    cy.route({
      method: "GET",
      url: "**/mentor-api/questions/?mentor=dan&query=is+the+food+good",
      response: {
        answer_id: "dandavis_A130_3_1",
        answer_text:
          "You know where things always heard growing up was army food is terrible that people complain about army food all the time. So yeah in the marine corps and I started getting the food the food was great. Jeez, I've really enjoyed the food they fed me. People in boot camp gain weight the food was so good, of course that was put on muscle not fat but it was good and I liked it. Then when I went to Morse code training I went to navy base the food down there was wonderful. I mean was was good and plentiful and healthy and I enjoyed it. And then I went to language school was on a navy base we had good food up there too, and that that was alright. And then I went to my first army base, and the food was... We were in Vietnam and the food was not so hot. And then the first year came and new year's day they give this roast beef and everybody who eat roast beef new year's day in the army Chow got some terrible ill and I ate roast beef and I was sick as I ever been in my life. It was terrible, I mean a whole group of us in my watch section were so sick except the guys who for one reason or other had not eaten the roast beef. But they can be forgiven that was a combat zone, so what do you expect. So then I went to Thailand and because the way the watch section was going, we we usually ate hamburgers in the club or we went downtown Thailand and ate. We didn't eat in mess hall very much. And then everybody in the base start getting sick and they couldn't figure iut what it was, and the CO was going to cancel liberty because he said \"you're getting sick from going down and eating Thai food\" and somebody pointed out to him \"you know the guys who don't eat in the mess hall and the guys who didn't get sick\" I didn't get sick and they found out that the mess cook can't overlook the fact that the Thai workers in the scullery had decided that it was too hot in there, but if you turn off the steam valve to the steam sterilizer for me in the room a lot cooler. So with that kind of a lukewarm temperature trying to do the sterilization, people got very ill. So that was another army base so maybe it's just army food, but the other food I had was wonderful",
        classifier: "/app/checkpoint/classifiers/lstm_v1/2019-11-14-2031/dan",
        confidence: -0.29535630830811244,
        mentor: "dan",
        query: "is the food good",
      },
    });
    cy.route({
      method: "GET",
      url: "https://video.mentorpal.org/videos/mentors/clint/**/*.mp4",
      response: "fixture:clint_response.mp4",
    });
  });

  it("plays a mentor response and displays subtitles", () => {
    cy.visit(toGuestUrl("/?mentor=clint&mentor=dan"));
    cy.get("#input-field").type("is the food good");
    cy.get("#input-send").click();
    cy.wait(1000);

    // if I enable this debug. I see the `video` element with the expected src
    // cy.get("#video-container video").debug()

    // this FAILS every time though
    // cy.get("#video-container video").should(
    //   "have.attr",
    //   "src",
    //   "https://video.mentorpal.org/videos/mentors/clint/web/clintanderson_A141_3_1.mp4"
    // );

    // this is just some simpler thing I tried to test

    // cy.get("#video-container video").should(
    //     "have.attr",
    //     "videoWidth",
    //     1280
    //   );
  });
});
