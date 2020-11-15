import { ApolloServer, gql, IResolvers, UserInputError } from "apollo-server";
import {
  createGame,
  recordPoint,
  getScore
} from "./api";

const typeDefs = gql`
  input PlayerSet {
    p1: String!
    p2: String!
  } 
  input Game
  {
    name: String!
    players: PlayerSet 
  }
  type SetScore
  {
    p1: Int!
    p2: Int!
  }
  type MatchScore
  {
    p1: String!
    p2: String!
  }
  type Score
  {
    gameId: ID!
    name: String!
    sets: [SetScore!]!
    currentGame: MatchScore!
    winner: String
  }
  input Point
  {
    gameId: ID!
    point: String!
  }
  type Query
  {
    score(gameId: ID!): Score
  }
  type Mutation {
    createGame(game: Game!): ID!
    recordPoint(point : Point!): Score
  }
`;

const resolvers: IResolvers = {
  Query: {
    score: (_ ,args) => { 
      const score = getScore(args.gameId);
      if(!score){
        throw new UserInputError('game not found');
      }
      return score;
    }
  },
  Mutation: {
    createGame: (_, args) => createGame(args.game.name, args.game.players),
    recordPoint: (_, args) => {
      const newScore = recordPoint(args.point.gameId, args.point.point);
      if (!newScore) {
        throw new UserInputError('game not found');
      }
      return newScore;
    } 
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
