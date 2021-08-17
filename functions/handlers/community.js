const { db } = require('../util/admin');

exports.getAllCommunity = (req, res) => {
    db.collection('community')
      .orderBy('createdAt', 'desc')
      .get()
      .then((data) => {
        let communties = [];
        data.forEach((doc) => {
          communties.push({
            communityId: doc.id,
            name: doc.data().name,
            description: doc.data().description,
            members: doc.data().members,
            image: doc.data().imageUrl
          });
        });
        return res.json(communties);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
  };

 // Get any user's details
exports.getAllCommunityPosts = (req, res) => {
    let communityData = {};
    db.doc(`/community/${req.params.communityId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
            communityData.community = { ...doc.data(), communityId:  req.params.communityId };
          return db
            .collection("screams")
            .where("communityId", "==", req.params.communityId)
            .orderBy("createdAt", "desc")
            .get();
        } else {
          return res.status(404).json({ errror: "Community not found" });
        }
      })
      .then((data) => {
        communityData.screams = [];
        data.forEach((doc) => {
            communityData.screams.push({
            body: doc.data().body,
            createdAt: doc.data().createdAt,
            userHandle: doc.data().userHandle,
            userImage: doc.data().userImage,
            likeCount: doc.data().likeCount,
            commentCount: doc.data().commentCount,
            screamId: doc.id,
            communityId: doc.data().communityId
          });
        });
        return res.json(communityData);
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  }; 

  exports.joinACommunity = (req, res) => {
    const membersArray = req.body.members;
    db.doc(`/community/${req.body.communityId}`).update({ members: [...membersArray]})
      .then(() => {
        return res.json({ message: "members updated successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: "something went wrong" });
      });
  };
  exports.createCommunity = (req, res) => {
      const membersArray = [];
      membersArray.push(req.user.handle);
    const newCommunity = {
      name: req.body.name,
      description: req.body.description,
      members: [...membersArray],
      imageUrl: req.body.imageUrl,
      createdAt: new Date().toISOString()
    };
    db.collection('community')
      .add(newCommunity)
      .then((doc) => {
        const resCommunity = newCommunity;
        resCommunity.communityId = doc.id;
        res.json(resCommunity);
      })
      .catch((err) => {
        res.status(500).json({ error: 'something went wrong' });
        console.error(err);
      });
  };