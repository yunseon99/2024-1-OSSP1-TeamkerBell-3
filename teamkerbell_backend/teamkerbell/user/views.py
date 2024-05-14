# user/views.py

from rest_framework.response import Response
from rest_framework.decorators import api_view
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from .serializers import ResumeSerializer, UserSerializer, BookmarkSerializer, CompListSerializer

from .models import BasicUser, Resume, Bookmark, Tag, Rude
from comp.models import Comp


@swagger_auto_schema(method="POST", tags=["유저 회원가입"], request_body=UserSerializer, operation_summary="유저 회원가입")
@api_view(['POST'])
def createUser(request):    
    if request.method == 'POST':
        user = UserSerializer(data=request.data)
        if user.is_valid():
            user.save()
            return Response(user.data, status=status.HTTP_201_CREATED)
        return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)
    

@swagger_auto_schema(method='get', tags=["유저 정보 가져오기/붙여넣기/삭제하기"])
@swagger_auto_schema(methods=['PUT','DELETE'], request_body=UserSerializer, tags=["유저 정보 가져오기/붙여넣기/삭제하기"])          
@api_view(['GET','PUT','DELETE'])
def getUserForId(request, user_id):
    try:
        user = BasicUser.objects.get(id=user_id)
    except BasicUser.DoesNotExist:
        return Response({'error' : {'code' : 404, 'message' : "User not found!"}}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = UserSerializer(user)
        return Response(serializer.data) 

    elif request.method == 'PUT':
        user_serializer = UserSerializer(user, data=request.data)
        if user_serializer.is_valid():
            user_serializer.save()
            return Response(user_serializer.data)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@swagger_auto_schema(method='GET', tags=["이력서 리스트 가져오기/쓰기"])
@swagger_auto_schema(methods=['POST'], request_body=ResumeSerializer, tags=["이력서 리스트 가져오기/쓰기"])
@api_view(['POST','GET'])
def manageResume(request, user_id):
    #URL에 들어가는 user_id를 의미한다.
    try:
        user = BasicUser.objects.get(id=user_id)
    except BasicUser.DoesNotExist:
        return Response({'error': {'code': 404, 'message': "User not found!"}}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        # 새로운 Resume 생성
        serializer = ResumeSerializer(data=request.data)
        if serializer.is_valid():
            print("user:", user_id, "새 Resume 생성 완료.")
            # serializer.save 좌변은 model에서 정의한 user 라는 값 우측은 user_id 로 얻어낸 user 값을 의미한다.
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'GET':
        # Resume 얻어오기
        resumes = Resume.objects.filter(user=user_id)  
        # Resume들 중에 user 값이(model에 정의된 model이라는 값) user_id인 값 
        if resumes.exists():  # 이력서가 존재하는지 확인
            serializer = ResumeSerializer(resumes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': {'code': 404, 'message': "Resumes not found!"}}, status=status.HTTP_404_NOT_FOUND)

@swagger_auto_schema(method='GET', tags=["세부 이력서 가져오기/수정/삭제하기"])
@swagger_auto_schema(methods=['DELETE', 'PATCH'], tags=["세부 이력서 가져오기/수정/삭제하기"])
@api_view(['DELETE', 'PATCH', 'GET'])
def detailResume(request, user_id, resume_id):
    try:
        user = BasicUser.objects.get(id=user_id)
    except BasicUser.DoesNotExist:
        return Response({'error': {'code': 404, 'message': "User not found!"}}, status=status.HTTP_404_NOT_FOUND)

    try:
        resume = Resume.objects.get(id=resume_id, user=user_id)
    except Resume.DoesNotExist:
        return Response({'error': {'code': 404, 'message': "Resume not found!"}}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        resume.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    elif request.method == 'PATCH':
        serializer = ResumeSerializer(resume, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'GET':
        serializer = ResumeSerializer(resume)
        return Response(serializer.data)


@swagger_auto_schema(methods=['POST'],tags=["공모전 찜하기/ 찜한 공모전 가져오기"])
@api_view(['POST'])
def compLike(request, user_id, comp_id):
        #URL에 들어가는 user_id를 의미한다.
    try:
        user = BasicUser.objects.get(id=user_id)
        comp = Comp.objects.get(id= comp_id)
    except BasicUser.DoesNotExist:
        return Response({'error': {'code': 404, 'message': "User not found!"}}, status=status.HTTP_404_NOT_FOUND)
    except Comp.DoesNotExist:
        return Response({'error': {'code': 404, 'message': "Comp not found!"}},
        status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        # user_id 의 유저가 comp_id의 공모전을 찜하기
        serializer = BookmarkSerializer(data=request.data, context={'user': user, 'comp': comp})
        if serializer.is_valid():
            print("user:", user, "comp" , comp, "찜하기 완료")
            serializer.save(user=user, comp=comp)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@swagger_auto_schema(method='GET', tags=["공모전 찜하기/ 찜한 공모전 가져오기"])
@api_view(['GET'])
def getCompLiked(request, user_id):
    if request.method == 'GET':
        # 찜한 Comps의 ID 얻어오기
        likedComps = Bookmark.objects.filter(user=user_id)
        
        # 찜한 Comps의 ID를 리스트로 추출
        likedCompsIds = likedComps.values_list('comp', flat=True)
        
        # 추출한 ID에 해당하는 Comp 객체들 조회
        comps = Comp.objects.filter(id__in=likedCompsIds)
        #id__in 은 likedCompsIds 리스트에 포함된 어떤 값과도 일치하는 Comp 객체들을 모두 찾아라라는 뜻으로 해석
        
        if comps.exists():  # 찜한 Comps가 존재하는지 확인
            serializer = CompListSerializer(comps, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': {'code': 404, 'message': "No liked comps found!"}}, status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(method='GET', tags=["나의 성취 가져오기"])
@api_view(['GET'])
def getMyAchievement(request, user_id):
    try:
        user = BasicUser.objects.get(id=user_id)
    except BasicUser.DoesNotExist:
        return Response({'error' : {'code' : 404, 'message' : "User not found!"}}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        # 칭찬 태그와 개수 가져오기
        complimentTags = Tag.objects.filter(user=user).values('id', 'count')
        complimentTagsList = [{"#{}".format(tag['id']): tag['count']} for tag in complimentTags]

        # 개선점 가져오기 (여기서는 Rude 모델에서 개선점으로 간주)
        improvementPoints = Rude.objects.filter(user=user, isrude=False).values_list('rudeness', flat=True)
        
        # 무례함 가져오기
        rudenessPoints = Rude.objects.filter(user=user, isrude=True).values_list('rudeness', flat=True)

        response_data = {
        "apiStatus": {
            "statusCode": "Y200",
            "statusMessage": "OK",
        },
        "temp": 36.5,  # 이 값은 예시입니다. 실제로는 다른 방식으로 계산하거나 데이터를 가져와야 합니다.
        "complimentTag": complimentTagsList,
        "improvementPoint": list(improvementPoints),
        "rudeness": list(rudenessPoints),
        }

    return Response(response_data, status=status.HTTP_200_OK)
