const should = require('should');
const appRoot = require('app-root-path');
const http = require(appRoot + '/lib/util/http');
const Problem = require(appRoot + '/lib/util/problem');
const Option = require(appRoot + '/lib/util/option');

describe('util/http', () => {
  describe('isTrue', () => {
    const { isTrue } = http;
    it('should return true for truthy strings', () => {
      isTrue('TRUE').should.equal(true);
      isTrue('True').should.equal(true);
      isTrue('true').should.equal(true);
    });

    it('should return false for all other values', () => {
      isTrue('yes').should.equal(false);
      isTrue('on').should.equal(false);
      isTrue('').should.equal(false);
      isTrue(null).should.equal(false);
      isTrue(undefined).should.equal(false);
    });
  });

  describe('urlPathname', () => {
    const { urlPathname } = http;
    it('should return the pathname part of a url', () => {
      urlPathname('https://www.opendatakit.org/help').should.equal('/help');
    });

    it('should not include query parameters', () => {
      urlPathname('https://www.opendatakit.org/a/test/path?and=some&extra=bits').should.equal('/a/test/path');
    });
  });

  describe('serialize', () => {
    const { serialize } = http;
    it('should passthrough nullish values', () => {
      should(serialize(null)).equal(null);
      should(serialize(undefined)).equal(undefined);
    });

    it('should call forApi on the target if it exists', () => {
      serialize({ forApi: () => 42 }).should.equal(42);
    });

    it('should leave strings alone', () => {
      serialize('hello').should.equal('hello');
    });

    it('should jsonify any other values it finds', () => {
      serialize(42).should.equal('42');
      serialize({ x: 1 }).should.equal('{"x":1}');
    });

    it('should subserialize each element if an array is found', () => {
      serialize([
        'hello',
        { forApi: () => 42 },
        [ 'world',
          { forApi: () => 23 } ]
      ]).should.eql(['hello', 42, [ 'world', 23 ] ]); // TODO: is this actually the desired result?
    });
  });

  describe('format response helpers', () => {
    const { contentType, xml, atom, json } = http;
    const mockRequest = () => ({ type: function(value) { this.contentType = value } });
    it('should ultimately return the result', () => {
      contentType()(42)(null, mockRequest()).should.equal(42);
    });

    it('should assign the requested content-type', () => {
      const request = mockRequest();
      contentType('mime/test')()(null, request);
      request.contentType.should.equal('mime/test');
    });

    it('should provide working shortcuts for common types', () => {
      const request = mockRequest();
      xml()(null, request);
      request.contentType.should.equal('application/xml');
      atom()(null, request);
      request.contentType.should.equal('application/atom+xml');
      json()(null, request);
      request.contentType.should.equal('application/json');
    });
  });

  describe('urlWithQueryParams', () => {
    const { urlWithQueryParams } = http;
    it('should return only a pathname', () => {
      urlWithQueryParams('/a/screaming/comes/across/the/sky').should.equal('/a/screaming/comes/across/the/sky');
    });

    it('should attach the given query parameters', () => {
      urlWithQueryParams('/kenosha/kid', { x: 1, y: 2 }).should.equal('/kenosha/kid?x=1&y=2');
    });

    it('should escape characters as required', () => {
      urlWithQueryParams('/path', { 'test?': '100%', 'etc=': '&c' }).should.equal('/path?test%3F=100%25&etc%3D=%26c');
    });

    it('should supplement and overwrite existing params', () => {
      urlWithQueryParams('/path?x=1&y=2', { y: 3, z: 5 }).should.equal('/path?x=1&y=3&z=5');
    });

    it('should unset keys given nully values', () => {
      urlWithQueryParams('/path?x=1&y=2&z=3', { x: null, z: undefined }).should.equal('/path?y=2');
    });
  });
});

